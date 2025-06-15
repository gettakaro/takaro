import { GameServerOutputDTOTypeEnum, ItemsOutputDTO } from '@takaro/apiclient';

// Centralized mapping of game server types to icon folder names
export const gameServerTypeToIconFolderMap: Record<GameServerOutputDTOTypeEnum, string> = {
  [GameServerOutputDTOTypeEnum.Mock]: 'mock',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
  [GameServerOutputDTOTypeEnum.Generic]: 'generic',
};

// Centralized function to construct fallback icon paths
export const getFallbackIconPath = (gameServerType: GameServerOutputDTOTypeEnum, itemCode: string): string => {
  return `/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${itemCode}.png`;
};

// Helper function to get the appropriate icon source for an item
// Overload 1: For use with ItemsOutputDTO (from API)
export function getItemIconSrc(
  item: ItemsOutputDTO,
  gameServerType: GameServerOutputDTOTypeEnum,
  fallbackIcon?: string,
): string;
// Overload 2: For use with item code directly (from inventory, etc.)
export function getItemIconSrc(
  itemIcon: string | undefined,
  gameServerType: GameServerOutputDTOTypeEnum,
  itemCode: string,
): string;
// Implementation
export function getItemIconSrc(
  itemOrIcon: ItemsOutputDTO | string | undefined,
  gameServerType: GameServerOutputDTOTypeEnum,
  fallbackIconOrItemCode: string = '/favicon.ico',
): string {
  // Handle first overload: ItemsOutputDTO case
  if (typeof itemOrIcon === 'object' && itemOrIcon !== null) {
    const item = itemOrIcon as ItemsOutputDTO;
    const fallbackIcon = fallbackIconOrItemCode || '/favicon.ico';

    // Future: Priority order when API client is updated with new fields:
    // 1. If item.iconOverride && item.iconBase64 → return `data:image/png;base64,${item.iconBase64}`
    // 2. Else if item.iconId → return getFallbackIconPath(gameServerType, item.iconId)
    // 3. Else → return fallbackIcon

    // Current: Use item.icon with fallback (until API client is regenerated)
    if (item.icon && gameServerType && gameServerTypeToIconFolderMap[gameServerType] !== 'Mock') {
      return getFallbackIconPath(gameServerType, item.icon);
    }

    return fallbackIcon;
  }

  // Handle second overload: item code case
  const itemIcon = itemOrIcon as string | undefined;
  const itemCode = fallbackIconOrItemCode;

  return itemIcon || getFallbackIconPath(gameServerType, itemCode);
}
