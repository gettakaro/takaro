import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';

export const gameTypeSelectOptions = [
  {
    name: 'Mock (testing purposes)',
    value: GameServerCreateDTOTypeEnum.Mock,
  },
  {
    name: 'Rust',
    value: GameServerCreateDTOTypeEnum.Rust,
  },
  {
    name: '7 Days to die',
    value: GameServerCreateDTOTypeEnum.Sevendaystodie,
  },
];
