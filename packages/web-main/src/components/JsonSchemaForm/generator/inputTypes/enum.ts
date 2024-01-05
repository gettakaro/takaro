import { BaseObject, InputType, SubType } from '.';

export interface EnumInput extends BaseObject {
  type: InputType.enum;
  values?: string[];
  default?: string;
  subType?: SubType;
}
