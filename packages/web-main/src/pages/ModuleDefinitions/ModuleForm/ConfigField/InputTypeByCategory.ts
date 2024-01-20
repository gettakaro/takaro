import { InputType } from 'components/JsonSchemaForm/generator/inputTypes';

interface InputTypeInfo {
  type: InputType;
  category: string;
  description: string;
}

// IMPORTANT: update inputTypeInfo when adding a new InputType
const inputTypeInfo: InputTypeInfo[] = [
  {
    type: InputType.string,
    category: 'basic',
    description: 'A single-line text input field for entering text.',
  },
  {
    type: InputType.number,
    category: 'basic',
    description: 'A numerical input field for entering numbers.',
  },
  {
    type: InputType.boolean,
    category: 'basic',
    description: 'A checkbox that toggles between true and false values.',
  },
  {
    type: InputType.select,
    category: 'basic',
    description: 'A dropdown menu with a list of self defined options.',
  },
  {
    type: InputType.item,
    category: 'custom',
    description: 'A dropdown menu providing a list of items available on the game server.',
  },
  {
    type: InputType.country,
    category: 'custom',
    description: 'A dropdown menu with a list of countries.',
  },
  {
    type: InputType.duration,
    category: 'custom',
    description: 'A time period input field.',
  },
];

export const groupedByCategory = inputTypeInfo.reduce((acc, info) => {
  if (!acc[info.category]) {
    acc[info.category] = [];
  }
  acc[info.category].push(info);
  return acc;
}, {} as Record<string, InputTypeInfo[]>);
