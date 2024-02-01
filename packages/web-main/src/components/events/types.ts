export type ValueType = string | number | boolean;

export enum InputType {
  field = 0,
  operator = 1,
  value = 2,
  conjunction = 3,
}

export type Filter = {
  field: string;
  operator: Operator;
  value: string;
};

export enum Operator {
  is = 'is',
}
