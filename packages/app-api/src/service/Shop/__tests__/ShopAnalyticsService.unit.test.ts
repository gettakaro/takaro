import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from '@takaro/test';
import sinon from 'sinon';
import type { SinonSandbox } from 'sinon';
import { ShopAnalyticsService } from '../ShopAnalyticsService.js';
import { Redis } from '@takaro/db';
import { DateTime } from 'luxon';

describe('ShopAnalyticsService', () => {
  let service: ShopAnalyticsService;
  let sandbox: SinonSandbox;
  let redisClientStub: any;

  const mockDomainId = 'test-domain-123';
  const startDate = DateTime.now().minus({ days: 30 }).toISO()!;
  const endDate = DateTime.now().toISO()!;
  const gameServerIds = ['server-1', 'server-2'];

  beforeEach(async () => {
    sandbox = sinon.createSandbox();

    // Mock Redis client
    redisClientStub = {
      get: sandbox.stub(),
      setEx: sandbox.stub(),
      del: sandbox.stub(),
      expire: sandbox.stub(),
    };

    sandbox.stub(Redis, 'getClient').resolves(redisClientStub);

    // Create service instance with mocked domain ID
    service = new ShopAnalyticsService(mockDomainId);
    (service as any).redisClient = redisClientStub;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getAnalytics', () => {
    it('should return cached data when available', async () => {
      const cachedData = {
        kpis: {
          revenue: { current: 1000, previous: 800, change: 200, changePercent: 25, sparkline: [] },
          ordersToday: { count: 10, hourlyDistribution: [], busiestHour: 14, weeklyAverage: 8 },
          activeCustomers: { total: 25, new: 5, returning: 20, growth: 10 },
          averageOrderValue: { current: 100, previous: 90, min: 50, max: 200, topItems: [] },
        },
        revenue: { timeSeries: [], byHour: [], total: 1000, growth: 25 },
        products: {
          topSellingProducts: [],
          topSellingCategories: [],
          underperformingProducts: [],
          outOfStockProducts: [],
        },
        orders: {
          statusDistribution: [],
          recentOrders: [],
          timeToFulfillment: { average: 0, min: 0, max: 0 },
          returnRate: 0,
        },
        customers: {
          newCustomers: 0,
          returningCustomers: 0,
          topBuyers: [],
          churnRate: 0,
          segments: [],
        },
        insights: [],
        lastUpdated: DateTime.now().toISO(),
        gameServerIds: gameServerIds,
      };

      redisClientStub.get.resolves(JSON.stringify(cachedData));

      const result = await service.getAnalytics(gameServerIds, startDate, endDate);

      expect(result.kpis.totalRevenue).to.equal(1000);
      expect(redisClientStub.get.calledOnce).to.equal(true);
      expect(redisClientStub.setEx.called).to.equal(false);
    });

    it('should generate fresh data when cache miss', async () => {
      redisClientStub.get.resolves(null);

      // Mock the private methods
      sandbox.stub(service as any, 'calculateKPIs').resolves({
        revenue: { current: 5000, previous: 4000, change: 1000, changePercent: 25, sparkline: [100, 200, 300] },
        ordersToday: { count: 15, hourlyDistribution: [], busiestHour: 19, weeklyAverage: 12 },
        activeCustomers: { total: 50, new: 10, returning: 40, growth: 15 },
        averageOrderValue: { current: 200, previous: 180, min: 100, max: 400, topItems: [] },
      });

      sandbox.stub(service as any, 'calculateRevenue').resolves({
        timeSeries: [],
        byHour: [],
        total: 5000,
        growth: 25,
      });

      sandbox.stub(service as any, 'calculateProducts').resolves({
        topSellingProducts: [],
        topSellingCategories: [],
        underperformingProducts: [],
        outOfStockProducts: [],
      });

      sandbox.stub(service as any, 'calculateOrders').resolves({
        statusDistribution: [],
        recentOrders: [],
        timeToFulfillment: { average: 0, min: 0, max: 0 },
        returnRate: 0,
      });

      sandbox.stub(service as any, 'calculateCustomers').resolves({
        newCustomers: 10,
        returningCustomers: 40,
        topBuyers: [],
        churnRate: 5,
        segments: [],
      });

      sandbox.stub(service as any, 'generateInsights').resolves([]);

      const result = await service.getAnalytics(gameServerIds, startDate, endDate);

      expect(result.kpis.totalRevenue).to.equal(5000);
      expect(redisClientStub.setEx.calledOnce).to.equal(true);
      expect(redisClientStub.setEx.firstCall.args[0]).to.include('shop-analytics');
      expect(redisClientStub.setEx.firstCall.args[2]).to.equal(3600); // 1 hour TTL
    });

    it('should handle cache errors gracefully', async () => {
      redisClientStub.get.rejects(new Error('Redis connection failed'));

      // Mock calculation methods
      sandbox.stub(service as any, 'calculateKPIs').resolves({
        revenue: { current: 1000, previous: 900, change: 100, changePercent: 11.1, sparkline: [] },
        ordersToday: { count: 5, hourlyDistribution: [], busiestHour: 12, weeklyAverage: 4 },
        activeCustomers: { total: 10, new: 2, returning: 8, growth: 5 },
        averageOrderValue: { current: 100, previous: 95, min: 50, max: 150, topItems: [] },
      });

      sandbox.stub(service as any, 'calculateRevenue').resolves({
        timeSeries: [],
        byHour: [],
        total: 1000,
        growth: 11.1,
      });
      sandbox.stub(service as any, 'calculateProducts').resolves({
        topSellingProducts: [],
        topSellingCategories: [],
        underperformingProducts: [],
        outOfStockProducts: [],
      });
      sandbox.stub(service as any, 'calculateOrders').resolves({
        statusDistribution: [],
        recentOrders: [],
        timeToFulfillment: { average: 0, min: 0, max: 0 },
        returnRate: 0,
      });
      sandbox.stub(service as any, 'calculateCustomers').resolves({
        newCustomers: 2,
        returningCustomers: 8,
        topBuyers: [],
        churnRate: 0,
        segments: [],
      });
      sandbox.stub(service as any, 'generateInsights').resolves([]);

      const result = await service.getAnalytics(gameServerIds, startDate, endDate);

      expect(result.kpis.totalRevenue).to.equal(1000);
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys', () => {
      const key1 = (service as any).getCacheKey(['server-2', 'server-1'], startDate, endDate);
      const key2 = (service as any).getCacheKey(['server-1', 'server-2'], startDate, endDate);

      expect(key1).to.equal(key2); // Should sort server IDs
      expect(key1).to.include(mockDomainId);
      expect(key1).to.include(startDate.split('T')[0]);
      expect(key1).to.include(endDate.split('T')[0]);
    });

    it('should handle empty gameServerIds', () => {
      const key = (service as any).getCacheKey([], startDate, endDate);

      expect(key).to.include('all-servers');
      expect(key).to.include(mockDomainId);
    });

    it('should handle undefined gameServerIds', () => {
      const key = (service as any).getCacheKey(undefined, startDate, endDate);

      expect(key).to.include('all-servers');
      expect(key).to.include(mockDomainId);
    });
  });

  describe('generateInsights', () => {
    it('should generate actionable insights from metrics', async () => {
      const metrics = {
        kpis: {
          revenue: { current: 10000, previous: 8000, change: 2000, changePercent: 25, sparkline: [] },
          ordersToday: { count: 50, hourlyDistribution: [], busiestHour: 19, weeklyAverage: 45 },
          activeCustomers: { total: 100, new: 20, returning: 80, growth: 15 },
          averageOrderValue: { current: 200, previous: 180, min: 100, max: 500, topItems: [] },
        },
        revenue: { total: 10000, growth: 25, timeSeries: [], byHour: [] },
        products: {
          topSellingProducts: [{ name: 'Diamond Sword', sales: 100, revenue: 5000 }],
          underperformingProducts: [{ name: 'Wood Stick', sales: 1, revenue: 10 }],
          outOfStockProducts: [],
          topSellingCategories: [],
        },
        customers: {
          newCustomers: 20,
          returningCustomers: 80,
          topBuyers: [],
          churnRate: 5,
          segments: [],
        },
        orders: {
          statusDistribution: [
            { status: 'completed', count: 90, percentage: 90 },
            { status: 'pending', count: 10, percentage: 10 },
          ],
          recentOrders: [],
          timeToFulfillment: { average: 30, min: 10, max: 60 },
          returnRate: 2,
        },
      };

      const result = await (service as any).generateInsights(metrics);

      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(0);

      // Check for revenue growth insight
      const revenueInsight = result.find((i: any) => i.title.toLowerCase().includes('revenue'));
      expect(revenueInsight).to.not.equal(undefined);
      expect(revenueInsight.type).to.equal('success');
    });

    it('should handle declining metrics', async () => {
      const metrics = {
        kpis: {
          revenue: { current: 5000, previous: 6000, change: -1000, changePercent: -16.7, sparkline: [] },
          ordersToday: { count: 10, hourlyDistribution: [], busiestHour: 12, weeklyAverage: 15 },
          activeCustomers: { total: 50, new: 5, returning: 45, growth: -10 },
          averageOrderValue: { current: 100, previous: 120, min: 50, max: 200, topItems: [] },
        },
        revenue: { total: 5000, growth: -16.7, timeSeries: [], byHour: [] },
        products: {
          topSellingProducts: [],
          underperformingProducts: [
            { name: 'Item 1', sales: 0, revenue: 0 },
            { name: 'Item 2', sales: 0, revenue: 0 },
          ],
          outOfStockProducts: [],
          topSellingCategories: [],
        },
        customers: {
          newCustomers: 5,
          returningCustomers: 45,
          topBuyers: [],
          churnRate: 15,
          segments: [],
        },
        orders: {
          statusDistribution: [
            { status: 'completed', count: 60, percentage: 60 },
            { status: 'canceled', count: 40, percentage: 40 },
          ],
          recentOrders: [],
          timeToFulfillment: { average: 60, min: 30, max: 120 },
          returnRate: 10,
        },
      };

      const result = await (service as any).generateInsights(metrics);

      const revenueInsight = result.find((i: any) => i.title.toLowerCase().includes('revenue'));
      expect(revenueInsight).to.not.equal(undefined);
      expect(revenueInsight.type).to.equal('warning');

      // Should also have insights about high churn rate
      const churnInsight = result.find((i: any) => i.description.toLowerCase().includes('churn'));
      expect(churnInsight).to.not.equal(undefined);
    });
  });

  describe('Date Range Handling', () => {
    it('should handle different date formats', async () => {
      redisClientStub.get.resolves(null);

      // Mock all calculation methods to return minimal valid data
      sandbox.stub(service as any, 'calculateKPIs').resolves({
        revenue: { current: 0, previous: 0, change: 0, changePercent: 0, sparkline: [] },
        ordersToday: { count: 0, hourlyDistribution: [], busiestHour: 0, weeklyAverage: 0 },
        activeCustomers: { total: 0, new: 0, returning: 0, growth: 0 },
        averageOrderValue: { current: 0, previous: 0, min: 0, max: 0, topItems: [] },
      });
      sandbox.stub(service as any, 'calculateRevenue').resolves({
        timeSeries: [],
        byHour: [],
        total: 0,
        growth: 0,
      });
      sandbox.stub(service as any, 'calculateProducts').resolves({
        topSellingProducts: [],
        topSellingCategories: [],
        underperformingProducts: [],
        outOfStockProducts: [],
      });
      sandbox.stub(service as any, 'calculateOrders').resolves({
        statusDistribution: [],
        recentOrders: [],
        timeToFulfillment: { average: 0, min: 0, max: 0 },
        returnRate: 0,
      });
      sandbox.stub(service as any, 'calculateCustomers').resolves({
        newCustomers: 0,
        returningCustomers: 0,
        topBuyers: [],
        churnRate: 0,
        segments: [],
      });
      sandbox.stub(service as any, 'generateInsights').resolves([]);

      // Test with ISO dates
      const result1 = await service.getAnalytics([], startDate, endDate);
      expect(result1).to.not.equal(undefined);

      // Test with DateTime objects converted to ISO
      const startDateTime = DateTime.now().minus({ days: 7 });
      const endDateTime = DateTime.now();
      const result2 = await service.getAnalytics([], startDateTime.toISO()!, endDateTime.toISO()!);
      expect(result2).to.not.equal(undefined);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      redisClientStub.get.resolves(null);

      // Make calculateKPIs throw an error
      sandbox.stub(service as any, 'calculateKPIs').rejects(new Error('Database connection failed'));

      // Other methods should still be stubbed but won't be reached
      sandbox.stub(service as any, 'calculateRevenue').resolves({});
      sandbox.stub(service as any, 'calculateProducts').resolves({});
      sandbox.stub(service as any, 'calculateOrders').resolves({});
      sandbox.stub(service as any, 'calculateCustomers').resolves({});
      sandbox.stub(service as any, 'generateInsights').resolves([]);

      try {
        await service.getAnalytics(gameServerIds, startDate, endDate);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).to.include('Database connection failed');
      }
    });
  });

  describe('Multi-server Filtering', () => {
    it('should filter by multiple game servers', async () => {
      redisClientStub.get.resolves(null);

      const multiServerIds = ['server-1', 'server-2', 'server-3'];

      let capturedServerIds: string[] | undefined;

      sandbox.stub(service as any, 'calculateKPIs').callsFake((...args: any[]) => {
        capturedServerIds = args[0] as string[];
        return Promise.resolve({
          revenue: { current: 1000, previous: 900, change: 100, changePercent: 11.1, sparkline: [] },
          ordersToday: { count: 5, hourlyDistribution: [], busiestHour: 12, weeklyAverage: 4 },
          activeCustomers: { total: 10, new: 2, returning: 8, growth: 5 },
          averageOrderValue: { current: 100, previous: 95, min: 50, max: 150, topItems: [] },
        });
      });

      sandbox.stub(service as any, 'calculateRevenue').resolves({
        timeSeries: [],
        byHour: [],
        total: 1000,
        growth: 11.1,
      });
      sandbox.stub(service as any, 'calculateProducts').resolves({
        topSellingProducts: [],
        topSellingCategories: [],
        underperformingProducts: [],
        outOfStockProducts: [],
      });
      sandbox.stub(service as any, 'calculateOrders').resolves({
        statusDistribution: [],
        recentOrders: [],
        timeToFulfillment: { average: 0, min: 0, max: 0 },
        returnRate: 0,
      });
      sandbox.stub(service as any, 'calculateCustomers').resolves({
        newCustomers: 2,
        returningCustomers: 8,
        topBuyers: [],
        churnRate: 0,
        segments: [],
      });
      sandbox.stub(service as any, 'generateInsights').resolves([]);

      await service.getAnalytics(multiServerIds, startDate, endDate);

      expect(capturedServerIds).to.deep.equal(multiServerIds);
    });

    it('should handle undefined gameServerIds as all servers', async () => {
      redisClientStub.get.resolves(null);

      let capturedServerIds: string[] | undefined;

      sandbox.stub(service as any, 'calculateKPIs').callsFake((...args: any[]) => {
        capturedServerIds = args[0] as string[] | undefined;
        return Promise.resolve({
          revenue: { current: 5000, previous: 4500, change: 500, changePercent: 11.1, sparkline: [] },
          ordersToday: { count: 15, hourlyDistribution: [], busiestHour: 14, weeklyAverage: 12 },
          activeCustomers: { total: 50, new: 10, returning: 40, growth: 15 },
          averageOrderValue: { current: 200, previous: 190, min: 100, max: 400, topItems: [] },
        });
      });

      sandbox.stub(service as any, 'calculateRevenue').resolves({
        timeSeries: [],
        byHour: [],
        total: 5000,
        growth: 11.1,
      });
      sandbox.stub(service as any, 'calculateProducts').resolves({
        topSellingProducts: [],
        topSellingCategories: [],
        underperformingProducts: [],
        outOfStockProducts: [],
      });
      sandbox.stub(service as any, 'calculateOrders').resolves({
        statusDistribution: [],
        recentOrders: [],
        timeToFulfillment: { average: 0, min: 0, max: 0 },
        returnRate: 0,
      });
      sandbox.stub(service as any, 'calculateCustomers').resolves({
        newCustomers: 10,
        returningCustomers: 40,
        topBuyers: [],
        churnRate: 5,
        segments: [],
      });
      sandbox.stub(service as any, 'generateInsights').resolves([]);

      const result = await service.getAnalytics(undefined, startDate, endDate);

      expect(capturedServerIds).to.equal(undefined);
      expect(result.kpis.totalRevenue).to.equal(5000);
    });
  });
});
