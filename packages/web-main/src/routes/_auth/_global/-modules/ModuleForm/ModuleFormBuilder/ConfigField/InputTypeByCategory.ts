import { InputType } from '../../../schemaConversion/inputTypes';

interface InputTypeInfo {
  type: InputType;
  category: string;
  description: string;
}

// IMPORTANT: update inputTypeInfo when adding a new InputType
const inputTypeInfo: InputTypeInfo[] = [
  {
    type: InputType.text,
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
    description: 'A checkbox that toggles between `true` and `false`.',
  },
  {
    type: InputType.array,
    category: 'basic',
    description: 'A field that allows multiple string values to be entered.',
  },
  {
    type: InputType.enumeration,
    category: 'custom',
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
    description: 'A field where a duration can be entered with multiple units.',
  },
  {
    type: InputType.role,
    category: 'custom',
    description: 'A dropdown menu with searchable list of roles.',
  },
];

export const groupedByCategory = inputTypeInfo.reduce(
  (acc, info) => {
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category].push(info);
    return acc;
  },
  {} as Record<string, InputTypeInfo[]>,
);
