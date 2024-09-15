export interface GameTime {
  days: number;
  hours: number;
  minutes: number;
}

export interface StatsResponse {
  gametime: GameTime;
  players: number;
  hostiles: number;
  animals: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface OnlinePlayerResponse {
  steamid: string;
  crossplatformid: string;
  entityid: number;
  ip: string;
  name: string;
  online: boolean;
  position: Position;
  level: number;
  health: number;
  stamina: number;
  zombiekills: number;
  playerkills: number;
  playerdeaths: number;
  score: number;
  totalplaytime: number;
  lastonline: string;
  ping: number;
}

export interface EntityLocation {
  id: number;
  name: string;
  position: Position;
}

export interface LandClaimsResponse {
  claimsize: number;
  claimowners: Array<ClaimOwner>;
}

export interface ClaimOwner {
  steamid: string;
  claimactive: boolean;
  playername: string;
  claims: Array<Position>;
}

export interface CommandResponse {
  command: string;
  parameters: string;
  result: string;
}

export interface AllowedCommands {
  commands: Array<CommandEntry>;
}

export interface CommandEntry {
  command: string;
  description: string;
  help: string;
}

export interface InventoryResponse {
  playername: string;
  userid: string;
  crossplatformid: string;
  bag: Array<InventoryItem>;
  belt: Array<InventoryItem>;
  equipment: PlayerEquipment;
}

export interface InventoryItem {
  count: number;
  name: string;
  icon: string;
  iconcolor: string;
  quality: string;
}

export interface PlayerEquipment extends Record<string, InventoryItem> {
  head: InventoryItem;
  eyes: InventoryItem;
  face: InventoryItem;
  armor: InventoryItem;
  jacket: InventoryItem;
  shirt: InventoryItem;
  legarmor: InventoryItem;
  pants: InventoryItem;
  boots: InventoryItem;
  gloves: InventoryItem;
}

export interface PlayerListResponse {
  total: number;
  totalUnfiltered: number;
  firstResult: number;
  players: Array<PlayerNotOnline>;
}

export interface PlayerNotOnline {
  steamid: string;
  entityid: number;
  ip: string;
  name: string;
  online: boolean;
  position: Position;
  totalplaytime: number;
  lastonline: string;
  ping: number;
  banned: boolean;
}

export interface PlayerLocation {
  steamid: string;
  crossplatformid: string;
  name: string;
  online: boolean;
  position: Position;
}

export interface GetServerInfo {
  GameType: GetServerInfoEntry;
  GameName: GetServerInfoEntry;
  GameHost: GetServerInfoEntry;
  ServerDescription: GetServerInfoEntry;
  ServerWebsiteURL: GetServerInfoEntry;
  LevelName: GetServerInfoEntry;
  GameMode: GetServerInfoEntry;
  Version: GetServerInfoEntry;
  IP: GetServerInfoEntry;
  CountryCode: GetServerInfoEntry;
  SteamID: GetServerInfoEntry;
  CompatibilityVersion: GetServerInfoEntry;
  Platform: GetServerInfoEntry;
  Port: GetServerInfoEntry;
  CurrentPlayers: GetServerInfoEntry;
  MaxPlayers: GetServerInfoEntry;
  GameDifficulty: GetServerInfoEntry;
  DayNightLength: GetServerInfoEntry;
  ZombiesRun: GetServerInfoEntry;
  DayCount: GetServerInfoEntry;
  Ping: GetServerInfoEntry;
  DropOnDeath: GetServerInfoEntry;
  DropOnQuit: GetServerInfoEntry;
  BloodMoonEnemyCount: GetServerInfoEntry;
  EnemyDifficulty: GetServerInfoEntry;
  PlayerKillingMode: GetServerInfoEntry;
  CurrentServerTime: GetServerInfoEntry;
  DayLightLength: GetServerInfoEntry;
  BlockDurabilityModifier: GetServerInfoEntry;
  AirDropFrequency: GetServerInfoEntry;
  LootAbundance: GetServerInfoEntry;
  LootRespawnDays: GetServerInfoEntry;
  MaxSpawnedZombies: GetServerInfoEntry;
  LandClaimSize: GetServerInfoEntry;
  LandClaimDeadZone: GetServerInfoEntry;
  LandClaimExpiryTime: GetServerInfoEntry;
  LandClaimDecayMode: GetServerInfoEntry;
  LandClaimOnlineDurabilityModifier: GetServerInfoEntry;
  LandClaimOfflineDurabilityModifier: GetServerInfoEntry;
  MaxSpawnedAnimals: GetServerInfoEntry;
  IsDedicated: GetServerInfoEntry;
  IsPasswordProtected: GetServerInfoEntry;
  ShowFriendPlayerOnMap: GetServerInfoEntry;
  BuildCreate: GetServerInfoEntry;
  EACEnabled: GetServerInfoEntry;
  Architecture64: GetServerInfoEntry;
  StockSettings: GetServerInfoEntry;
  StockFiles: GetServerInfoEntry;
  RequiresMod: GetServerInfoEntry;
  AirDropMarker: GetServerInfoEntry;
  EnemySpawnMode: GetServerInfoEntry;
  IsPublic: GetServerInfoEntry;
}

export interface GetServerInfoEntry {
  type: string;
  value: any;
}

export interface GetWebUIUpdatesResponse {
  gametime: GameTime;
  players: number;
  hostiles: number;
  animals: number;
  newlogs: number;
}

export interface LogLine {
  date: string;
  time: string;
  uptime: string;
  msg: string;
  trace: string;
  type: string;
}

export interface GetLog {
  firstLine: number;
  lastLine: number;
  entries: Array<LogLine>;
}
