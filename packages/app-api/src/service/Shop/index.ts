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
    const orders = await this.orderRepo.find(filters);
    return orders;
  }

  async createOrder(listingId: string, amount: number): Promise<ShopOrderOutputDTO> {
    const userId = ctx.data.user;
    if (!userId) throw new errors.UnauthorizedError();
    return this.orderRepo.create(new ShopOrderCreateInternalDTO({ listingId, userId, amount }));
  }

  async claimOrder(orderId: string): Promise<ShopOrderOutputDTO> {
    const userId = ctx.data.user;
    if (!userId) throw new errors.UnauthorizedError();
    return this.orderRepo.update(orderId, new ShopOrderUpdateDTO({ status: ShopOrderStatus.COMPLETED }));
  }

  async cancelOrder(orderId: string): Promise<ShopOrderOutputDTO> {
    const userId = ctx.data.user;
    if (!userId) throw new errors.UnauthorizedError();
    return this.orderRepo.update(orderId, new ShopOrderUpdateDTO({ status: ShopOrderStatus.CANCELED }));
  }
}
