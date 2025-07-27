import { TakaroService } from '../Base.js';
import { ShopListingModel, ShopListingRepo } from '../../db/shopListing.js';
import { ctx, errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { ShopOrderRepo } from '../../db/shopOrder.js';

export { ShopCategoryService } from './ShopCategoryService.js';
import {
  ShopListingOutputDTO,
  ShopListingCreateDTO,
  ShopListingUpdateDTO,
  ShopOrderOutputDTO,
  ShopOrderUpdateDTO,
  ShopOrderStatus,
  ShopOrderCreateInternalDTO,
  ShopImportOptions,
  ShopListingItemMetaInputDTO,
} from './dto.js';
import { UserService } from '../User/index.js';
import { checkPermissions } from '../AuthService.js';
import { PERMISSIONS } from '@takaro/auth';
import { PlayerService } from '../Player/index.js';
import { PlayerOnGameServerService } from '../PlayerOnGameserverService.js';
import { GameServerService } from '../GameServerService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../EventService.js';
import {
  TakaroEventShopOrderCreated,
  TakaroEventShopListingCreated,
  TakaroEventShopListingDeleted,
  TakaroEventShopListingUpdated,
  TakaroEventShopOrderStatusChanged,
  TakaroEventShopOrderDeliveryFailed,
  TakaroEventShopItem,
  TakaroEventShopStockEmpty,
  TakaroEventShopStockUpdated,
} from '@takaro/modules';
import { IMessageOptsDTO, IPlayerReferenceDTO } from '@takaro/gameserver';
import { ItemsService } from '../ItemsService.js';

@traceableClass('service:shopListing')
export class ShopListingService extends TakaroService<
  ShopListingModel,
  ShopListingOutputDTO,
  ShopListingCreateDTO,
  ShopListingUpdateDTO
> {
  private eventService = new EventService(this.domainId);
  get repo() {
    return new ShopListingRepo(this.domainId);
  }

  get orderRepo() {
    return new ShopOrderRepo(this.domainId);
  }

  private async checkIfOrderBelongsToUser(order: ShopOrderOutputDTO) {
    const callingUserId = ctx.data.user;
    if (!callingUserId) throw new errors.UnauthorizedError();

    const userHasHighPrivileges = await this.userHasHighPrivileges();
    if (userHasHighPrivileges) {
      this.log.debug(`User ${callingUserId} has high privileges, skipping order ownership check`);
      return;
    }

    const userRes = await new UserService(this.domainId).find({ filters: { playerId: [order.playerId] } });
    if (!userRes.results.length) throw new errors.NotFoundError('User not found');
    if (userRes.results.length > 1) throw new errors.BadRequestError('Multiple users found for player');

    const belongsToUser = callingUserId && userRes.results[0].id === callingUserId;

    if (!belongsToUser) {
      this.log.warn(`User ${callingUserId} tried to access order ${order.id} that does not belong to them`, {
        orderId: order.id,
        userId: callingUserId,
      });
      throw new errors.NotFoundError('Shop order not found');
    }
  }

  private async userHasHighPrivileges() {
    const userId = ctx.data.user;
    if (!userId) throw new errors.UnauthorizedError();

    const userService = new UserService(this.domainId);
    const user = await userService.findOne(userId);
    const userHasHighPrivileges = checkPermissions([PERMISSIONS.MANAGE_SHOP_ORDERS], user);

    return userHasHighPrivileges;
  }

  async find(filters: ITakaroQuery<ShopListingOutputDTO>): Promise<PaginatedOutput<ShopListingOutputDTO>> {
    const listings = await this.repo.find(filters);
    return listings;
  }

  async findOne(id: string): Promise<ShopListingOutputDTO> {
    const listing = await this.repo.findOne(id);
    if (!listing) throw new errors.NotFoundError(`Shop listing with id ${id} not found`);
    return listing;
  }

  async create(listing: ShopListingCreateDTO): Promise<ShopListingOutputDTO> {
    const itemCodes = listing.items.map((item) => item.code).filter(Boolean);
    const itemsService = new ItemsService(this.domainId);
    const items = await itemsService.find({ filters: { code: itemCodes } });
    listing.items = listing.items.map((item) => {
      const code = items.results.find((i) => i.code === item.code);
      if (!code) {
        if (!item.itemId)
          throw new errors.BadRequestError(`Item with code ${item.code} not found and no itemId provided`);
        return new ShopListingItemMetaInputDTO({
          amount: item.amount,
          quality: item.quality,
          itemId: item.itemId,
        });
      }
      return new ShopListingItemMetaInputDTO({
        amount: item.amount,
        quality: item.quality,
        code: item.code,
      });
    });
    const created = await this.repo.create(listing);

    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_LISTING_CREATED,
        gameserverId: created.gameServerId,
        meta: new TakaroEventShopListingCreated({
          id: created.id,
        }),
      }),
    );

    return created;
  }

  async update(id: string, item: ShopListingUpdateDTO): Promise<ShopListingOutputDTO> {
    const existing = await this.findOne(id);
    
    // NEW: Validate stock management changes
    if (item.stockManagementEnabled === true && !existing.stockManagementEnabled) {
      if (item.stock === undefined) {
        throw new errors.BadRequestError(
          'Stock quantity must be provided when enabling stock management'
        );
      }
    }

    // Going from non-draft to draft means we need to cancel all pending orders
    if (!existing.draft && item.draft) {
      const orders = await this.orderRepo.find({ filters: { listingId: [id], status: [ShopOrderStatus.PAID] } });
      await Promise.allSettled(orders.results.map((order) => this.cancelOrder(order.id)));
    }

    const updated = await this.repo.update(id, item);

    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_LISTING_UPDATED,
        gameserverId: updated.gameServerId,
        meta: new TakaroEventShopListingUpdated({
          id: updated.id,
        }),
      }),
    );
    
    // NEW: Emit SHOP_STOCK_UPDATED event when stock changes
    if (item.stock !== undefined || item.stockManagementEnabled !== undefined) {
      await this.eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.SHOP_STOCK_UPDATED,
          gameserverId: updated.gameServerId,
          meta: new TakaroEventShopStockUpdated({
            listingId: updated.id,
            listingName: updated.name,
            oldStock: existing.stockManagementEnabled ? existing.stock : undefined,
            newStock: updated.stock || 0,
            stockManagementEnabled: updated.stockManagementEnabled,
          }),
        }),
      );
    }

    return updated;
  }

  async delete(id: string): Promise<string> {
    // Find all related orders and cancel them
    const orders = await this.orderRepo.find({ filters: { listingId: [id], status: [ShopOrderStatus.PAID] } });
    await Promise.allSettled(orders.results.map((order) => this.cancelOrder(order.id)));

    await this.repo.delete(id);

    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_LISTING_DELETED,
        gameserverId: id,
        meta: new TakaroEventShopListingDeleted({
          id,
        }),
      }),
    );

    return id;
  }

  async findOrders(filters: ITakaroQuery<ShopOrderOutputDTO>): Promise<PaginatedOutput<ShopOrderOutputDTO>> {
    const userId = ctx.data.user;
    if (!userId) throw new errors.UnauthorizedError();
    const userService = new UserService(this.domainId);
    const user = await userService.findOne(userId);
    const userHasHighPrivileges = checkPermissions([PERMISSIONS.MANAGE_SHOP_ORDERS], user);

    if (!userHasHighPrivileges) {
      if (!user.playerId)
        return {
          results: [],
          total: 0,
        };
      if (!filters.filters) filters.filters = {};
      filters.filters.playerId = [user.playerId];
    }

    const orders = await this.orderRepo.find(filters);
    return orders;
  }

  async findOneOrder(id: string): Promise<ShopOrderOutputDTO> {
    const order = await this.orderRepo.findOne(id);
    if (!order) throw new errors.NotFoundError(`Shop order with id ${id} not found`);
    await this.checkIfOrderBelongsToUser(order);
    return order;
  }

  async createOrder(listingId: string, amount: number, playerIdOverride?: string): Promise<ShopOrderOutputDTO> {
    let playerId = null;
    const userIdFromContext = ctx.data.user;
    let userFromContext = null;
    if (userIdFromContext) {
      const userService = new UserService(this.domainId);
      userFromContext = await userService.findOne(userIdFromContext);
      playerId = userFromContext.playerId;
    }

    if (playerIdOverride) {
      if (!(await this.userHasHighPrivileges()))
        throw new errors.BadRequestError(
          'You cannot create an order for another user. Remove the userId field to create an order for yourself',
        );
      playerId = playerIdOverride;
    }

    // By this point, we should have a playerId resolved from either the context or the override
    if (!playerId) throw new errors.BadRequestError('Unknown player, make sure you have linked your account');

    const { knex } = await this.repo.getModel();
    
    const result = await ctx.runInTransaction(knex, async () => {
      // All repository calls automatically use the context transaction
      const listing = await this.findOne(listingId);
      
      if (listing.draft) throw new errors.BadRequestError('Cannot order a draft listing');
      if (listing.deletedAt) throw new errors.BadRequestError('Cannot order a deleted listing');
      
      // NEW: Stock validation
      if (listing.stockManagementEnabled) {
        if (listing.stock !== null && listing.stock !== undefined && listing.stock < amount) {
          throw new errors.BadRequestError(
            `Insufficient stock. Available: ${listing.stock}, Requested: ${amount}`
          );
        }
        
        // Stock decrement uses context transaction automatically
        await this.repo.decrementStock(listingId, amount);
      }
      
      const gameServerId = listing.gameServerId;

      const playerService = new PlayerService(this.domainId);
      const { pogs } = await playerService.resolveFromId(playerId, gameServerId);
      const pog = pogs.find((pog) => pog.gameServerId === gameServerId);
      if (!pog) throw new errors.BadRequestError('You have not logged in to the game server yet.');

      // Currency deduction uses context transaction automatically
      const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
      await playerOnGameServerService.deductCurrency(pog.id, listing.price * amount);

      // Order creation uses context transaction automatically
      const order = await this.orderRepo.create(
        new ShopOrderCreateInternalDTO({ 
          listingId, 
          playerId, 
          amount,
          gameServerId 
        })
      );
      
      // Check final stock after purchase
      let finalStock: number | undefined;
      if (listing.stockManagementEnabled && listing.stock !== null && listing.stock !== undefined) {
        finalStock = listing.stock - amount;
      }
      
      return { order, listing, pog, finalStock };
    });

    // Events are emitted AFTER transaction commits successfully
    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_ORDER_CREATED,
        gameserverId: result.listing.gameServerId,
        playerId: result.pog.playerId,
        meta: new TakaroEventShopOrderCreated({
          id: result.order.id,
          listingName: result.listing.name,
          price: result.listing.price,
          amount: amount,
          totalPrice: result.listing.price * amount,
          items: result.listing.items.map(
            (item) =>
              new TakaroEventShopItem({
                name: item.item.name,
                code: item.item.code,
                amount: item.amount,
                quality: item.quality,
              }),
          ),
        }),
      }),
    );

    // NEW: Stock-related event
    if (result.listing.stockManagementEnabled && result.finalStock === 0) {
      await this.eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.SHOP_STOCK_EMPTY,
          gameserverId: result.listing.gameServerId,
          meta: new TakaroEventShopStockEmpty({
            listingId: result.listing.id,
            listingName: result.listing.name,
          }),
        }),
      );
    }

    return result.order;
  }

  async claimOrder(orderId: string): Promise<ShopOrderOutputDTO> {
    const { knex } = await this.orderRepo.getModel();

    // First, check if the order exists and belongs to user, and get necessary data
    const initialOrder = await this.orderRepo.findOne(orderId);
    if (!initialOrder) throw new errors.NotFoundError(`Shop order with id ${orderId} not found`);
    await this.checkIfOrderBelongsToUser(initialOrder);

    // Pre-transaction checks: Get listing and verify player is online
    const listing = await this.findOne(initialOrder.listingId);
    const gameServerId = listing.gameServerId;

    const playerService = new PlayerService(this.domainId);
    const { pogs } = await playerService.resolveFromId(initialOrder.playerId, gameServerId);
    const pog = pogs.find((pog) => pog.gameServerId === gameServerId);
    if (!pog) throw new errors.BadRequestError('You have not logged in to the game server yet.');
    if (!pog.online)
      throw new errors.BadRequestError(
        'You must be online in the game server to claim the order. If you have just logged in, please wait a few seconds and try again.',
      );

    // Phase 1: Quick database transaction to update order status
    const transactionResult = await ctx.runInTransaction(knex, async () => {
      // Lock the order row for update to prevent concurrent claims
      const order = await this.orderRepo.findOneForUpdate(orderId);
      if (!order) throw new errors.NotFoundError(`Shop order with id ${orderId} not found`);

      // Check status again within the transaction with the lock held
      if (order.status !== ShopOrderStatus.PAID)
        throw new errors.BadRequestError(`Can only claim paid, unclaimed orders. Current status: ${order.status}`);

      // Update status immediately after checking to minimize race condition window
      const updatedOrder = await this.orderRepo.update(
        orderId,
        new ShopOrderUpdateDTO({ status: ShopOrderStatus.COMPLETED }),
      );

      return { updatedOrder, order };
    });

    // Phase 2: Make external game server calls (outside of transaction)
    const { updatedOrder, order } = transactionResult;

    try {
      const gameServerService = new GameServerService(this.domainId);
      if (listing.items.length) {
        await Promise.all(
          listing.items.map((item) =>
            gameServerService.giveItem(
              gameServerId,
              pog.playerId,
              item.item.id,
              item.amount * order.amount,
              item.quality,
            ),
          ),
        );

        await gameServerService.sendMessage(
          gameServerId,
          'You have received items from a shop order.',
          new IMessageOptsDTO({
            recipient: new IPlayerReferenceDTO({ gameId: pog.gameId }),
          }),
        );
        for (const item of listing.items) {
          await gameServerService.sendMessage(
            gameServerId,
            `${item.amount * order.amount}x ${item.item.name}`,
            new IMessageOptsDTO({
              recipient: new IPlayerReferenceDTO({ gameId: pog.gameId }),
            }),
          );
        }
      }

      await this.eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.SHOP_ORDER_STATUS_CHANGED,
          gameserverId: gameServerId,
          playerId: pog.playerId,
          meta: new TakaroEventShopOrderStatusChanged({
            id: updatedOrder.id,
            status: ShopOrderStatus.COMPLETED,
          }),
        }),
      );
    } catch (deliveryError: any) {
      // Log the delivery failure but don't throw - the order is already marked as completed
      this.log.error(
        `Failed to deliver items for order ${orderId} after successful claim: ${deliveryError.message}`,
        deliveryError,
      );

      // Create an event to signal the delivery failure
      await this.eventService.create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.SHOP_ORDER_DELIVERY_FAILED,
          gameserverId: gameServerId,
          playerId: pog.playerId,
          meta: new TakaroEventShopOrderDeliveryFailed({
            id: updatedOrder.id,
            error: deliveryError.message,
            items: listing.items.map(
              (item) =>
                new TakaroEventShopItem({
                  name: item.item.name,
                  code: item.item.code,
                  amount: item.amount * order.amount,
                  quality: item.quality,
                }),
            ),
          }),
        }),
      );
    }

    return updatedOrder;
  }

  async cancelOrder(orderId: string): Promise<ShopOrderOutputDTO> {
    const { knex } = await this.orderRepo.getModel();
    
    const result = await ctx.runInTransaction(knex, async () => {
      // All operations use context transaction automatically
      const order = await this.orderRepo.findOne(orderId);
      if (!order) throw new errors.NotFoundError(`Shop order with id ${orderId} not found`);
      await this.checkIfOrderBelongsToUser(order);
      
      if (order.status !== ShopOrderStatus.PAID)
        throw new errors.BadRequestError(
          `Can only cancel paid orders that weren't claimed yet. Current status: ${order.status}`,
        );
      
      // Update order status
      const updatedOrder = await this.orderRepo.update(
        orderId,
        new ShopOrderUpdateDTO({ status: ShopOrderStatus.CANCELED }),
      );
      
      // Get listing details
      const listing = await this.findOne(order.listingId);
      
      // Refund currency (uses context transaction automatically)
      const pogsService = new PlayerOnGameServerService(this.domainId);
      const pog = (await pogsService.find({ 
        filters: { playerId: [order.playerId], gameServerId: [listing.gameServerId] } 
      })).results[0];
      if (!pog) throw new errors.NotFoundError('Player not found');
      await pogsService.addCurrency(pog.id, listing.price * order.amount);
      
      // NEW: Restore stock if stock management is enabled
      if (listing.stockManagementEnabled) {
        await this.repo.incrementStock(listing.id, order.amount);
      }
      
      return { updatedOrder, listing, order, refundAmount: listing.price * order.amount };
    });
    
    // Emit events after transaction commits
    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_ORDER_STATUS_CHANGED,
        gameserverId: result.listing.gameServerId,
        userId: ctx.data.user,
        playerId: result.order.playerId,
        meta: new TakaroEventShopOrderStatusChanged({
          id: result.updatedOrder.id,
          status: ShopOrderStatus.CANCELED,
        }),
      }),
    );

    return result.updatedOrder;
  }

  async import(data: ShopListingCreateDTO[], options: ShopImportOptions) {
    if (options.replace) {
      this.log.info('Replacing all shop listings');
      await this.repo.deleteMany(options.gameServerId);
    }

    const promises = await Promise.allSettled(
      data.map((listing) => {
        listing.draft = options.draft;
        listing.gameServerId = options.gameServerId;
        return this.create(listing);
      }),
    );

    const failed = promises.filter((p) => p.status === 'rejected');
    if (failed.length) {
      this.log.warn('Failed to import shop listings', { failed });
    }

    return promises;
  }
}
