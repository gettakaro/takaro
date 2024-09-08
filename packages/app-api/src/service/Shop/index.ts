import { TakaroService } from '../Base.js';
import { ShopListingModel, ShopListingRepo } from '../../db/shopListing.js';
import { ctx, errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { ShopOrderRepo } from '../../db/shopOrder.js';
import {
  ShopListingOutputDTO,
  ShopListingCreateDTO,
  ShopListingUpdateDTO,
  ShopOrderOutputDTO,
  ShopOrderUpdateDTO,
  ShopOrderStatus,
  ShopOrderCreateInternalDTO,
} from './dto.js';
import { UserService } from '../UserService.js';
import { checkPermissions } from '../AuthService.js';
import { PERMISSIONS } from '@takaro/auth';
import { PlayerService } from '../PlayerService.js';
import { PlayerOnGameServerService } from '../PlayerOnGameserverService.js';
import { GameServerService } from '../GameServerService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../EventService.js';
import {
  TakaroEventShopOrderCreated,
  TakaroEventShopListingCreated,
  TakaroEventShopListingDeleted,
  TakaroEventShopListingUpdated,
  TakaroEventShopOrderStatusChanged,
} from '@takaro/modules';
import { IMessageOptsDTO, IPlayerReferenceDTO } from '@takaro/gameserver';

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
    const userId = ctx.data.user;
    if (!userId) throw new errors.UnauthorizedError();

    const belongsToUser = userId && order.userId === userId;

    if (!belongsToUser) {
      const userHasHighPrivileges = await this.userHasHighPrivileges();

      if (!userHasHighPrivileges) {
        this.log.warn(`User ${userId} tried to access order ${order.id} that does not belong to them`, {
          orderId: order.id,
          userId,
        });
        throw new errors.NotFoundError('Shop order not found');
      }
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

  async create(item: ShopListingCreateDTO): Promise<ShopListingOutputDTO> {
    const created = await this.repo.create(item);

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
      if (!filters.filters) filters.filters = {};
      filters.filters.userId = [userId];
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

  async createOrder(listingId: string, amount: number, userIdOverride?: string): Promise<ShopOrderOutputDTO> {
    const userHasHighPrivileges = await this.userHasHighPrivileges();

    if (!userHasHighPrivileges && userIdOverride)
      throw new errors.BadRequestError(
        'You cannot create an order for another user. Remove the userId field to create an order for yourself',
      );

    const userIdFromContext = ctx.data.user;
    const userId = userIdOverride || userIdFromContext;
    if (!userId) throw new errors.UnauthorizedError();

    const userService = new UserService(this.domainId);
    const user = await userService.findOne(userId);

    if (!user.playerId)
      throw new errors.BadRequestError(
        'You have not linked your account to a player yet. Please link your account to a player first.',
      );

    const listing = await this.findOne(listingId);
    if (listing.draft) throw new errors.BadRequestError('Cannot order a draft listing');
    if (listing.deletedAt) throw new errors.BadRequestError('Cannot order a deleted listing');
    const gameServerId = listing.gameServerId;

    const playerService = new PlayerService(this.domainId);
    const { pogs } = await playerService.resolveFromId(user.playerId, gameServerId);
    const pog = pogs.find((pog) => pog.gameServerId === gameServerId);
    if (!pog) throw new errors.BadRequestError('You have not logged in to the game server yet.');

    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    await playerOnGameServerService.deductCurrency(pog.id, listing.price * amount);

    const order = await this.orderRepo.create(new ShopOrderCreateInternalDTO({ listingId, userId, amount }));

    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_ORDER_CREATED,
        gameserverId: gameServerId,
        playerId: pog.playerId,
        userId,
        meta: new TakaroEventShopOrderCreated({
          id: order.id,
        }),
      }),
    );

    return order;
  }

  async claimOrder(orderId: string): Promise<ShopOrderOutputDTO> {
    const order = await this.orderRepo.findOne(orderId);
    if (!order) throw new errors.NotFoundError(`Shop order with id ${orderId} not found`);
    await this.checkIfOrderBelongsToUser(order);
    if (order.status !== ShopOrderStatus.PAID)
      throw new errors.BadRequestError(`Can only claim paid, unclaimed orders. Current status: ${order.status}`);

    const userService = new UserService(this.domainId);
    const user = await userService.findOne(order.userId);

    if (!user.playerId)
      throw new errors.BadRequestError(
        'You have not linked your account to a player yet. Please link your account to a player first.',
      );

    const listing = await this.findOne(order.listingId);
    const gameServerId = listing.gameServerId;

    const playerService = new PlayerService(this.domainId);
    const { pogs } = await playerService.resolveFromId(user.playerId, gameServerId);
    const pog = pogs.find((pog) => pog.gameServerId === gameServerId);
    if (!pog) throw new errors.BadRequestError('You have not logged in to the game server yet.');
    if (!pog.online)
      throw new errors.BadRequestError(
        'You must be online in the game server to claim the order. If you have just logged in, please wait a few seconds and try again.',
      );

    const gameServerService = new GameServerService(this.domainId);
    if (listing.items.length) {
      for (let i = 0; i < order.amount; i++) {
        await Promise.allSettled(
          listing.items.map((item) =>
            gameServerService.giveItem(gameServerId, pog.playerId, item.item.code, item.amount),
          ),
        );
      }

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
          `${item.amount}x ${item.item.name}`,
          new IMessageOptsDTO({
            recipient: new IPlayerReferenceDTO({ gameId: pog.gameId }),
          }),
        );
      }
    }

    const updatedOrder = await this.orderRepo.update(
      orderId,
      new ShopOrderUpdateDTO({ status: ShopOrderStatus.COMPLETED }),
    );

    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_ORDER_STATUS_CHANGED,
        gameserverId: gameServerId,
        playerId: pog.playerId,
        userId: order.userId,
        meta: new TakaroEventShopOrderStatusChanged({
          id: updatedOrder.id,
          status: ShopOrderStatus.COMPLETED,
        }),
      }),
    );

    return updatedOrder;
  }

  async cancelOrder(orderId: string): Promise<ShopOrderOutputDTO> {
    const order = await this.orderRepo.findOne(orderId);
    if (!order) throw new errors.NotFoundError(`Shop order with id ${orderId} not found`);
    await this.checkIfOrderBelongsToUser(order);
    if (order.status !== ShopOrderStatus.PAID)
      throw new errors.BadRequestError(
        `Can only cancel paid orders that weren't claimed yet. Current status: ${order.status}`,
      );
    const updatedOrder = await this.orderRepo.update(
      orderId,
      new ShopOrderUpdateDTO({ status: ShopOrderStatus.CANCELED }),
    );

    const listing = await this.findOne(order.listingId);
    const gameServerId = listing.gameServerId;

    const user = await new UserService(this.domainId).findOne(order.userId);

    // Refund the player
    const pogsService = new PlayerOnGameServerService(this.domainId);
    const pog = (await pogsService.find({ filters: { playerId: [user.playerId], gameServerId: [gameServerId] } }))
      .results[0];
    if (!pog) throw new errors.NotFoundError('Player not found');
    await pogsService.addCurrency(pog.id, listing.price * order.amount);

    await this.eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.SHOP_ORDER_STATUS_CHANGED,
        gameserverId: gameServerId,
        userId: user.id,
        playerId: user.playerId,
        meta: new TakaroEventShopOrderStatusChanged({
          id: updatedOrder.id,
          status: ShopOrderStatus.CANCELED,
        }),
      }),
    );

    return updatedOrder;
  }
}
