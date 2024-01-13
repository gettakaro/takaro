import { BaseObject, InputType, SubType } from '.';

export interface EnumInput extends BaseObject {
  type: InputType.enum;

  subType: SubType;

  // only when subType is 'custom' it should have values property
  // TODO: make this type stricter
  values: string[];

  // Item cannot have default value because the items will be different for each game
  // and potentially server (mods)
  default: this['subType'] extends 'item' ? never : string;
}
