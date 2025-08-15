-- Migration: Optimize indexes for shop analytics queries
-- Date: 2025-08-15
-- Purpose: Add indexes to improve performance of shop analytics queries

-- Index for filtering orders by domain, status, and date range
-- This is the most common filter combination in analytics queries
CREATE INDEX IF NOT EXISTS idx_shoporder_analytics 
ON "shopOrder" (domain, status, "createdAt")
WHERE status IN ('COMPLETED', 'PAID');

-- Index for joining orders with listings and filtering by date
-- Helps with revenue calculations and product metrics
CREATE INDEX IF NOT EXISTS idx_shoporder_listing_date 
ON "shopOrder" ("listingId", "createdAt")
WHERE status IN ('COMPLETED', 'PAID');

-- Index for customer analytics (unique players)
CREATE INDEX IF NOT EXISTS idx_shoporder_player_analytics 
ON "shopOrder" (domain, "playerId", "createdAt")
WHERE status IN ('COMPLETED', 'PAID');

-- Composite index for shop listings to speed up joins
CREATE INDEX IF NOT EXISTS idx_shoplisting_composite 
ON "shopListing" (id, "gameServerId", price)
WHERE "deletedAt" IS NULL AND draft = false;

-- Index for filtering listings by game server and active status
CREATE INDEX IF NOT EXISTS idx_shoplisting_active 
ON "shopListing" (domain, "gameServerId")
WHERE "deletedAt" IS NULL AND draft = false;

-- Add comment to indexes for documentation
COMMENT ON INDEX idx_shoporder_analytics IS 'Optimizes analytics queries filtering by domain, status, and date';
COMMENT ON INDEX idx_shoporder_listing_date IS 'Optimizes joins between orders and listings for revenue calculations';
COMMENT ON INDEX idx_shoporder_player_analytics IS 'Optimizes customer analytics and unique player counts';
COMMENT ON INDEX idx_shoplisting_composite IS 'Optimizes listing lookups in analytics joins';
COMMENT ON INDEX idx_shoplisting_active IS 'Optimizes filtering active listings by game server';