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

@traceableClass('service:shopListing')
export class ShopListingService extends TakaroService<
  ShopListingModel,
  ShopListingOutputDTO,
  ShopListingCreateDTO,
  ShopListingUpdateDTO
> {
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
      const userService = new UserService(this.domainId);
      const user = await userService.findOne(userId);
      const userHasHighPrivileges = checkPermissions([PERMISSIONS.MANAGE_SHOP_ORDERS], user);

      if (!userHasHighPrivileges) {
        this.log.warn(`User ${userId} tried to access order ${order.id} that does not belong to them`, {
          orderId: order.id,
          userId,
        });
        throw new errors.NotFoundError('Shop order not found');
      }
    }
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
    return created;
  }

  async update(id: string, item: ShopListingUpdateDTO): Promise<ShopListingOutputDTO> {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<string> {
    await this.repo.delete(id);
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

  async createOrder(listingId: string, amount: number): Promise<ShopOrderOutputDTO> {
    const userId = ctx.data.user;
    if (!userId) throw new errors.UnauthorizedError();
    const order = await this.orderRepo.create(new ShopOrderCreateInternalDTO({ listingId, userId, amount }));
    return order;
  }

  async claimOrder(orderId: string): Promise<ShopOrderOutputDTO> {
    const userId = ctx.data.user;
    if (!userId) throw new errors.UnauthorizedError();

    const order = await this.orderRepo.findOne(orderId);
    if (!order) throw new errors.NotFoundError(`Shop order with id ${orderId} not found`);

    const userService = new UserService(this.domainId);
    const user = await userService.findOne(userId);

    if (!user.playerId)
      throw new errors.BadRequestError(
        'You have not linked your account to a player yet. Please link your account to a player first.'
      );

    const listing = await this.findOne(order.listingId);
    const gameServerId = listing.gameServerId;

    const playerService = new PlayerService(this.domainId);
    const { pogs } = await playerService.resolveFromId(user.playerId, gameServerId);
    const pog = pogs.find((pog) => pog.gameServerId === gameServerId);
    if (!pog) throw new errors.BadRequestError('You have not logged in to the game server yet.');
    if (!pog.online)
      throw new errors.BadRequestError(
        'You must be online in the game server to claim the order. If you have just logged in, please wait a few seconds and try again.'
      );

    throw new Error('implement item giving...');
    return this.orderRepo.update(orderId, new ShopOrderUpdateDTO({ status: ShopOrderStatus.COMPLETED }));
  }

  async cancelOrder(orderId: string): Promise<ShopOrderOutputDTO> {
    const order = await this.orderRepo.findOne(orderId);
    if (!order) throw new errors.NotFoundError(`Shop order with id ${orderId} not found`);
    return this.orderRepo.update(orderId, new ShopOrderUpdateDTO({ status: ShopOrderStatus.CANCELED }));
  }
}
