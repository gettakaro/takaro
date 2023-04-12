export interface IResourceUpdate {
  id: string;
}

export interface IServerToClientEvents {
  ['gameserver:create']: (args: IResourceUpdate) => void;
  ['gameserver:update']: (args: IResourceUpdate) => void;
  ['gameserver:delete']: (args: IResourceUpdate) => void;
}
