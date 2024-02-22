import { FilterInputType } from '.';

export enum Operator {
  is = ':',
  contains = '*',
}

export const getOperatorLabel = (operator: Operator) => {
  return Object.keys(Operator).find((key) => Operator[key as keyof typeof Operator] === operator) ?? '';
};

export const getOperators = (type: FilterInputType | undefined) => {
  const defaultOperators = [Operator.is, Operator.contains];

  switch (type) {
    case FilterInputType.uuid:
    case FilterInputType.number:
    case FilterInputType.datetime:
      return [Operator.is];
    default:
      return defaultOperators;
  }
};
