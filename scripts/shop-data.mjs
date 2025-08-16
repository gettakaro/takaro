#!/bin/node

import knex from 'knex';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

// Database connection
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || 'takaro',
    password: process.env.POSTGRES_PASSWORD || 'takaro-dev',
    database: process.env.POSTGRES_DB || 'takaro',
  }
});

// Configuration
const config = {
  domain: process.env.SHOP_DATA_DOMAIN || process.env.TAKARO_DEV_DOMAIN_NAME || 'test-domain',
  listingCount: parseInt(process.env.SHOP_DATA_LISTING_COUNT) || 50,
  orderCount: parseInt(process.env.SHOP_DATA_ORDER_COUNT) || 300,
  daysBack: parseInt(process.env.SHOP_DATA_DAYS_BACK) || 30,
  clean: process.env.SHOP_DATA_CLEAN === 'true',
};

// Shop data templates
const CATEGORIES = [
  { name: 'Weapons', emoji: '⚔️', children: [
    { name: 'Melee Weapons', emoji: '🗡️' },
    { name: 'Ranged Weapons', emoji: '🔫' }
  ]},
  { name: 'Armor', emoji: '🛡️', children: [
    { name: 'Light Armor', emoji: '🦺' },
    { name: 'Heavy Armor', emoji: '🛡️' }
  ]},
  { name: 'Resources', emoji: '📦', children: [
    { name: 'Raw Materials', emoji: '🪨' },
    { name: 'Crafting Components', emoji: '⚙️' }
  ]},
  { name: 'Consumables', emoji: '💊', children: [
    { name: 'Food', emoji: '🍖' },
    { name: 'Medical', emoji: '💉' }
  ]},
  { name: 'Tools', emoji: '🔧', children: [
    { name: 'Mining Tools', emoji: '⛏️' },
    { name: 'Farming Tools', emoji: '🌾' }
  ]},
  { name: 'Building', emoji: '🏗️', children: [
    { name: 'Blocks', emoji: '🧱' },
    { name: 'Decorations', emoji: '🎨' }
  ]},
  { name: 'Vehicles', emoji: '🚗' },
  { name: 'Base', emoji: '🏠' }
];

const LISTING_TEMPLATES = {
  SEVENDAYSTODIE: [
    // Starter packs
    { name: 'Survivor Starter Kit', description: 'Everything you need to survive your first night', price: 50, category: 'Base' },
    { name: 'Builder Starter Pack', description: 'Basic building materials to get started', price: 75, category: 'Building' },
    { name: 'Explorer Bundle', description: 'Tools and supplies for exploration', price: 125, category: 'Tools' },
    
    // Resource packs
    { name: 'Wood Bundle', description: 'Stack of wood for construction', price: 20, category: 'Raw Materials' },
    { name: 'Stone Pack', description: 'Stone blocks for building', price: 30, category: 'Raw Materials' },
    { name: 'Iron Bundle', description: 'Iron for crafting and building', price: 60, category: 'Raw Materials' },
    { name: 'Steel Pack', description: 'High-grade steel materials', price: 150, category: 'Crafting Components' },
    
    // Weapons
    { name: 'Pistol Package', description: '9mm pistol with ammo', price: 300, category: 'Ranged Weapons' },
    { name: 'Shotgun Bundle', description: 'Pump shotgun with shells', price: 500, category: 'Ranged Weapons' },
    { name: 'Rifle Kit', description: 'Hunting rifle with scope', price: 750, category: 'Ranged Weapons' },
    { name: 'Melee Weapon Set', description: 'Baseball bat and machete', price: 200, category: 'Melee Weapons' },
    
    // Medical
    { name: 'First Aid Bundle', description: 'Bandages and medical supplies', price: 100, category: 'Medical' },
    { name: 'Medicine Pack', description: 'Antibiotics and painkillers', price: 250, category: 'Medical' },
    
    // Food
    { name: 'Food Crate', description: 'Canned goods and water', price: 80, category: 'Food' },
    { name: 'Farming Seeds', description: 'Seeds for sustainable food', price: 120, category: 'Food' },
    
    // Premium packs
    { name: 'VIP Survival Pack', description: 'Premium survival gear', price: 1500, category: 'Base' },
    { name: 'Elite Weapons Bundle', description: 'Top tier weapons and ammo', price: 3000, category: 'Weapons' },
    { name: 'Fortress Builder Kit', description: 'Everything for a secure base', price: 2500, category: 'Building' },
    { name: 'Vehicle Package', description: 'Motorcycle with fuel', price: 5000, category: 'Vehicles' }
  ],
  
  GENERIC: [
    // Basic resources
    { name: 'Wood Bundle', description: 'Basic wood resources', price: 20, category: 'Raw Materials' },
    { name: 'Stone Pack', description: 'Stone for building', price: 30, category: 'Raw Materials' },
    { name: 'Iron Package', description: 'Iron ingots', price: 50, category: 'Raw Materials' },
    { name: 'Gold Bundle', description: 'Precious gold', price: 150, category: 'Raw Materials' },
    
    // Magic items
    { name: 'Magic Wand - Apprentice', description: 'Basic magic wand', price: 300, category: 'Ranged Weapons' },
    { name: 'Magic Wand - Master', description: 'Advanced magic wand', price: 800, category: 'Ranged Weapons' },
    { name: 'Enchanted Bundle', description: 'Magical items collection', price: 1200, category: 'Weapons' },
    
    // Healing
    { name: 'Healing Potion Pack', description: 'Restore health instantly', price: 50, category: 'Medical' },
    { name: 'Medicine Bundle', description: 'Various healing items', price: 120, category: 'Medical' },
    
    // Admin items
    { name: 'Admin Gun', description: 'Powerful admin weapon', price: 5000, category: 'Ranged Weapons' },
    { name: 'Admin Tool Kit', description: 'Admin management tools', price: 3000, category: 'Tools' },
    
    // Starter packs
    { name: 'Beginner Bundle', description: 'Start your journey', price: 100, category: 'Base' },
    { name: 'Adventure Pack', description: 'For the adventurous', price: 450, category: 'Base' },
    
    // VIP packages
    { name: 'VIP Bronze', description: 'Bronze tier benefits', price: 500, category: 'Base' },
    { name: 'VIP Silver', description: 'Silver tier benefits', price: 1250, category: 'Base' },
    { name: 'VIP Gold', description: 'Gold tier benefits', price: 2500, category: 'Base' },
    { name: 'VIP Platinum', description: 'Platinum tier benefits', price: 5000, category: 'Base' },
    { name: 'VIP Diamond', description: 'Ultimate VIP status', price: 10000, category: 'Base' }
  ],
  
  RUST: [
    // Basic resources
    { name: 'Wood Stack', description: 'Wood for building', price: 25, category: 'Raw Materials' },
    { name: 'Stone Stack', description: 'Stone resources', price: 35, category: 'Raw Materials' },
    { name: 'Metal Fragments', description: 'Metal for crafting', price: 60, category: 'Crafting Components' },
    { name: 'High Quality Metal', description: 'Premium metal', price: 200, category: 'Crafting Components' },
    
    // Weapons
    { name: 'Assault Rifle Kit', description: 'AK-47 with ammo', price: 800, category: 'Ranged Weapons' },
    { name: 'Sniper Bundle', description: 'Bolt action rifle', price: 1200, category: 'Ranged Weapons' },
    { name: 'SMG Package', description: 'Custom SMG setup', price: 600, category: 'Ranged Weapons' },
    
    // Building
    { name: 'Base Starter Kit', description: 'Foundation and walls', price: 300, category: 'Building' },
    { name: 'Security Package', description: 'Doors and locks', price: 400, category: 'Building' },
    
    // Raiding
    { name: 'Raid Kit', description: 'C4 and rockets', price: 2000, category: 'Weapons' },
    { name: 'Defense Bundle', description: 'Turrets and traps', price: 1500, category: 'Building' },
    
    // Premium
    { name: 'Elite Raider Pack', description: 'Everything for raiding', price: 5000, category: 'Weapons' },
    { name: 'Fortress Builder', description: 'Complete base package', price: 4000, category: 'Building' }
  ]
};

// Utility functions
async function cleanExistingData() {
  console.log('🧹 Cleaning existing shop data...');
  
  const domainId = await getDomainId();
  if (!domainId) {
    console.log('  No domain found, skipping cleanup');
    return;
  }
  
  // Delete in correct order due to foreign keys
  await db('shopOrder').where('domain', domainId).del();
  await db('itemOnShopListing').whereIn('listingId', 
    db('shopListing').select('id').where('domain', domainId)
  ).del();
  await db('shopListingCategory').where('domain', domainId).del();
  await db('shopListing').where('domain', domainId).del();
  await db('shopCategory').where('domain', domainId).del();
  
  console.log('  ✓ Cleaned existing data');
}

async function getDomainId() {
  const result = await db('domains')
    .where('name', config.domain)
    .first();
  return result?.id;
}

async function getGameServers() {
  const domainId = await getDomainId();
  if (!domainId) {
    throw new Error(`Domain "${config.domain}" not found`);
  }
  
  return await db('gameservers')
    .where('domain', domainId)
    .where('enabled', true)
    .select('id', 'name', 'type');
}

async function getOrCreateCategories(domainId) {
  const existingCategories = await db('shopCategory')
    .where('domain', domainId)
    .select('id', 'name', 'parentId');
  
  if (existingCategories.length > 0) {
    console.log(`  Using ${existingCategories.length} existing categories`);
    return existingCategories;
  }
  
  console.log('  Creating shop categories...');
  const createdCategories = [];
  
  // Create parent categories
  for (const category of CATEGORIES) {
    const [parent] = await db('shopCategory')
      .insert({
        id: randomUUID(),
        domain: domainId,
        name: category.name,
        emoji: category.emoji,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning('*');
    
    createdCategories.push(parent);
    
    // Create child categories
    if (category.children) {
      for (const child of category.children) {
        const [childCat] = await db('shopCategory')
          .insert({
            id: randomUUID(),
            domain: domainId,
            name: child.name,
            emoji: child.emoji,
            parentId: parent.id,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning('*');
        
        createdCategories.push(childCat);
      }
    }
  }
  
  console.log(`  ✓ Created ${createdCategories.length} categories`);
  return createdCategories;
}

async function createListings(server, categories, domainId) {
  const templates = LISTING_TEMPLATES[server.type] || LISTING_TEMPLATES.GENERIC;
  const listings = [];
  const listingsToCreate = Math.min(config.listingCount, templates.length * 3);
  
  console.log(`  Creating ${listingsToCreate} listings for ${server.name}...`);
  
  for (let i = 0; i < listingsToCreate; i++) {
    const template = templates[i % templates.length];
    const variation = Math.floor(i / templates.length);
    
    // Add variation to name and price for duplicates
    const name = variation > 0 ? `${template.name} - ${['Special', 'Premium', 'Deluxe'][variation]}` : template.name;
    const price = Math.round(template.price * (1 + variation * 0.5));
    
    // Find matching category
    const category = categories.find(c => 
      c.name === template.category || 
      c.parentId && categories.find(p => p.id === c.parentId)?.name === template.category
    );
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60)); // Random date in last 60 days
    
    const [listing] = await db('shopListing')
      .insert({
        id: randomUUID(),
        domain: domainId,
        gameServerId: server.id,
        name: name,
        description: template.description,
        price: price,
        draft: false,
        createdAt: createdDate,
        updatedAt: createdDate
      })
      .returning('*');
    
    listings.push(listing);
    
    // Link to category
    if (category) {
      await db('shopListingCategory')
        .insert({
          id: randomUUID(),
          domain: domainId,
          shopListingId: listing.id,
          shopCategoryId: category.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    // Add items (simplified - just add a few mock items)
    await addItemsToListing(listing.id, server.id);
  }
  
  return listings;
}

async function addItemsToListing(listingId, serverId) {
  // Get available items for this server
  const items = await db('items')
    .where('gameserverId', serverId)
    .limit(3)
    .select('id');
  
  if (items.length === 0) return;
  
  // Add 1-3 items to the listing
  const itemCount = Math.min(items.length, Math.floor(Math.random() * 3) + 1);
  
  for (let i = 0; i < itemCount; i++) {
    await db('itemOnShopListing')
      .insert({
        id: randomUUID(),
        listingId: listingId,
        itemId: items[i % items.length].id,
        amount: Math.floor(Math.random() * 10) + 1,
        quality: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflict()
      .ignore();
  }
}

async function generateOrders(server, listings, domainId) {
  if (listings.length === 0) {
    console.log('  No listings to create orders for');
    return [];
  }
  
  console.log(`  Generating ${config.orderCount} orders with historical data...`);
  
  // Get players for this server
  const players = await db('playerOnGameServer')
    .where('gameServerId', server.id)
    .limit(50)
    .select('playerId');
  
  if (players.length === 0) {
    console.log('  No players found for this server');
    return [];
  }
  
  const orders = [];
  const now = new Date();
  
  for (let i = 0; i < config.orderCount; i++) {
    // Random date in the last N days
    const daysAgo = Math.random() * config.daysBack;
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    
    // Randomize time of day with realistic distribution
    // Peak hours: 10am-10pm with highest activity 6pm-9pm
    const hourWeight = Math.random();
    let hour;
    if (hourWeight < 0.1) {
      // 10% chance: Early morning (0-8am)
      hour = Math.floor(Math.random() * 9);
    } else if (hourWeight < 0.3) {
      // 20% chance: Morning (9am-12pm)
      hour = 9 + Math.floor(Math.random() * 3);
    } else if (hourWeight < 0.5) {
      // 20% chance: Afternoon (12pm-5pm)
      hour = 12 + Math.floor(Math.random() * 5);
    } else if (hourWeight < 0.85) {
      // 35% chance: Peak evening (6pm-9pm)
      hour = 18 + Math.floor(Math.random() * 3);
    } else {
      // 15% chance: Late evening (9pm-11pm)
      hour = 21 + Math.floor(Math.random() * 3);
    }
    
    orderDate.setHours(hour);
    orderDate.setMinutes(Math.floor(Math.random() * 60));
    orderDate.setSeconds(Math.floor(Math.random() * 60));
    
    // Weekend spike - 50-100% more orders on weekends
    const dayOfWeek = orderDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Skip some weekday orders to create weekend spike effect
    if (!isWeekend && Math.random() < 0.3) {
      continue;
    }
    
    // Random listing and player
    const listing = listings[Math.floor(Math.random() * listings.length)];
    const player = players[Math.floor(Math.random() * players.length)];
    
    // Order status distribution
    let status;
    const rand = Math.random();
    if (rand < 0.65) {
      status = 'COMPLETED';
    } else if (rand < 0.97) {
      status = 'PAID';
    } else {
      status = 'CANCELED';
    }
    
    // Amount (1-3 items typically)
    const amount = Math.ceil(Math.random() * 3);
    
    // Create order
    const [order] = await db('shopOrder')
      .insert({
        id: randomUUID(),
        domain: domainId,
        listingId: listing.id,
        amount: amount,
        status: status,
        playerId: player.playerId,
        createdAt: orderDate,
        updatedAt: new Date(orderDate.getTime() + Math.random() * 3600000) // Updated within an hour
      })
      .returning('*');
    
    orders.push(order);
  }
  
  return orders;
}

// Main function
async function main() {
  try {
    console.log('🛍️ Shop Data Generator');
    console.log('━'.repeat(50));
    console.log(`Domain: ${config.domain}`);
    console.log(`Listings per server: ${config.listingCount}`);
    console.log(`Orders per server: ${config.orderCount}`);
    console.log(`Historical days: ${config.daysBack}`);
    console.log(`Clean existing: ${config.clean}`);
    console.log('━'.repeat(50));
    
    const domainId = await getDomainId();
    if (!domainId) {
      throw new Error(`Domain "${config.domain}" not found. Please create it first with 'npm run dev:init'`);
    }
    
    if (config.clean) {
      await cleanExistingData();
    }
    
    const servers = await getGameServers();
    if (servers.length === 0) {
      throw new Error('No enabled game servers found in domain');
    }
    
    console.log(`\nFound ${servers.length} game server(s):`);
    servers.forEach(s => console.log(`  - ${s.name} (${s.type})`));
    
    // Get or create categories once for the domain
    const categories = await getOrCreateCategories(domainId);
    
    let totalListings = 0;
    let totalOrders = 0;
    
    for (const server of servers) {
      console.log(`\n📦 Processing ${server.name} (${server.type})`);
      
      // Check existing data
      const existingListings = await db('shopListing')
        .where('gameServerId', server.id)
        .count('* as count');
      
      const existingOrders = await db('shopOrder')
        .whereIn('listingId', 
          db('shopListing').select('id').where('gameServerId', server.id)
        )
        .count('* as count');
      
      console.log(`  Existing: ${existingListings[0].count} listings, ${existingOrders[0].count} orders`);
      
      // Create new data
      const listings = await createListings(server, categories, domainId);
      const orders = await generateOrders(server, listings, domainId);
      
      totalListings += listings.length;
      totalOrders += orders.length;
      
      console.log(`  ✓ Created ${listings.length} listings and ${orders.length} orders`);
      
      // Show summary
      const revenue = await db('shopOrder as o')
        .join('shopListing as l', 'o.listingId', 'l.id')
        .where('l.gameServerId', server.id)
        .sum(db.raw('o.amount * l.price'))
        .first();
      
      console.log(`  💰 Total revenue: $${(revenue?.sum || 0).toLocaleString()}`);
    }
    
    console.log('\n' + '━'.repeat(50));
    console.log('✅ Shop data generation complete!');
    console.log(`   Total: ${totalListings} listings, ${totalOrders} orders across ${servers.length} server(s)`);
    console.log('━'.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run the script
main();