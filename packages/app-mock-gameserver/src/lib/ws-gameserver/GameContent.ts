import { IItemDTO, IEntityDTO, EntityType } from '@takaro/gameserver';

// Single source of truth for all game items and entities
// These are used by both the gameserver methods and event generation

export const GAME_ITEMS: IItemDTO[] = [
  new IItemDTO({
    code: 'wood',
    name: 'Wood',
    description: 'Wood is good',
  }),
  new IItemDTO({
    code: 'stone',
    name: 'Stone',
    description: 'Stone can get you stoned',
  }),
  new IItemDTO({
    code: 'iron',
    name: 'Iron',
    description: 'Iron is strong',
  }),
  new IItemDTO({
    code: 'gold',
    name: 'Gold',
    description: 'Gold is shiny',
  }),
  new IItemDTO({
    code: 'adminGun',
    name: 'Admin Gun',
    description: 'A powerful gun for admins',
  }),
  new IItemDTO({
    code: 'healingPotion',
    name: 'Healing Potion',
    description: 'Restores health over time',
  }),
  new IItemDTO({
    code: 'magicWand',
    name: 'Magic Wand',
    description: 'A wand that casts spells',
  }),
];

export const GAME_ENTITIES: IEntityDTO[] = [
  new IEntityDTO({
    code: 'zombie',
    name: 'Zombie',
    description: 'A shambling undead creature',
    type: EntityType.HOSTILE,
  }),
  new IEntityDTO({
    code: 'skeleton',
    name: 'Skeleton',
    description: 'An undead archer',
    type: EntityType.HOSTILE,
  }),
  new IEntityDTO({
    code: 'spider',
    name: 'Spider',
    description: 'A large arachnid',
    type: EntityType.HOSTILE,
  }),
  new IEntityDTO({
    code: 'cow',
    name: 'Cow',
    description: 'A peaceful farm animal',
    type: EntityType.FRIENDLY,
  }),
  new IEntityDTO({
    code: 'pig',
    name: 'Pig',
    description: 'A pink farm animal',
    type: EntityType.FRIENDLY,
  }),
  new IEntityDTO({
    code: 'sheep',
    name: 'Sheep',
    description: 'A woolly farm animal',
    type: EntityType.FRIENDLY,
  }),
  new IEntityDTO({
    code: 'chicken',
    name: 'Chicken',
    description: 'A small farm bird',
    type: EntityType.FRIENDLY,
  }),
  new IEntityDTO({
    code: 'wolf',
    name: 'Wolf',
    description: 'A wild canine that can be tamed',
    type: EntityType.NEUTRAL,
  }),
  new IEntityDTO({
    code: 'enderman',
    name: 'Enderman',
    description: 'A tall dark creature from another dimension',
    type: EntityType.NEUTRAL,
  }),
  new IEntityDTO({
    code: 'villager',
    name: 'Villager',
    description: 'A peaceful NPC that trades items',
    type: EntityType.FRIENDLY,
    metadata: { profession: 'merchant', canTrade: true },
  }),
  new IEntityDTO({
    code: 'creeper',
    name: 'Creeper',
    description: 'An explosive green creature',
    type: EntityType.HOSTILE,
    metadata: { explosive: true, range: 3 },
  }),
  new IEntityDTO({
    code: 'horse',
    name: 'Horse',
    description: 'A rideable animal',
    type: EntityType.FRIENDLY,
    metadata: { rideable: true, speed: 'fast' },
  }),
];

// Utility functions to extract codes for random selection in event generation
export const getItemCodes = (): string[] => GAME_ITEMS.map((item) => item.code);
export const getEntityCodes = (): string[] => GAME_ENTITIES.map((entity) => entity.code);
