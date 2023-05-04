import { TextFieldControl, textFieldControlTester } from './controls';
import { JsonFormsRendererRegistryEntry } from '@jsonforms/core';

export const TakaroRenderer: JsonFormsRendererRegistryEntry[] = [
  // controls
  {
    tester: textFieldControlTester,
    renderer: TextFieldControl,
  },
];
