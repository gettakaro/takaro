# Takaro Development Scripts

This directory contains utility scripts for development and testing.

## Available Scripts

### dev-data.mjs
Creates initial domains and users for development.

```bash
npm run dev:init
# or
node scripts/dev-data.mjs
```

### shop-data.mjs
Generates comprehensive shop data including categories, listings, and historical orders with realistic patterns.

#### Features
- Creates hierarchical shop categories
- Generates diverse shop listings based on server type
- Creates historical orders (up to 30 days back)
- Implements weekend sales spikes (50-100% more orders)
- Realistic order status distribution (65% completed, 32% paid, 3% canceled)

#### Usage

```bash
# Run with defaults (50 listings, 200 orders per server)
node scripts/shop-data.mjs

# Clean existing data first
SHOP_DATA_CLEAN=true node scripts/shop-data.mjs

# Custom amounts
SHOP_DATA_LISTING_COUNT=100 SHOP_DATA_ORDER_COUNT=500 node scripts/shop-data.mjs

# Specify domain
SHOP_DATA_DOMAIN="my-domain" node scripts/shop-data.mjs

# Full example
SHOP_DATA_CLEAN=true SHOP_DATA_LISTING_COUNT=75 SHOP_DATA_ORDER_COUNT=300 SHOP_DATA_DAYS_BACK=60 node scripts/shop-data.mjs
```

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SHOP_DATA_DOMAIN` | `TAKARO_DEV_DOMAIN_NAME` or "test-domain" | Domain to populate |
| `SHOP_DATA_LISTING_COUNT` | 50 | Number of listings per server |
| `SHOP_DATA_ORDER_COUNT` | 200 | Number of orders per server |
| `SHOP_DATA_DAYS_BACK` | 30 | Days of historical data |
| `SHOP_DATA_CLEAN` | false | Clean existing data first |

#### Data Patterns

The script creates different listing types based on server type:
- **SEVENDAYSTODIE**: Survival items, weapons, building materials, vehicles
- **GENERIC**: Magic items, admin tools, VIP packages
- **RUST**: Raiding equipment, base building, high-tier weapons

Orders are distributed with:
- Random dates over the specified period
- Weekend sales spikes (automatically generated)
- Realistic status distribution
- Multiple items per order (1-3 typically)

### dev-remove-domains.mjs
Removes development domains for cleanup.

```bash
node scripts/dev-remove-domains.mjs
```

## Database Connection

All database scripts use the standard PostgreSQL environment variables:
- `POSTGRES_HOST` (default: 127.0.0.1)
- `POSTGRES_PORT` (default: 5432)
- `POSTGRES_USER` (default: takaro)
- `POSTGRES_PASSWORD` (default: takaro-dev)
- `POSTGRES_DB` (default: takaro)

Make sure your `.env` file has these configured correctly.