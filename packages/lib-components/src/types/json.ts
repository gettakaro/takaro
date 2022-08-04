export type AnyJson =
  | boolean
  | number
  | string
  | null
  | JsonArray
  | IJsonMap
  | Date;
export interface IJsonMap {
  [key: string]: AnyJson;
}
export type JsonArray = Array<AnyJson>;
