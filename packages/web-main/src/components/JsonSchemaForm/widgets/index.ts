import { RegistryWidgetsType } from '@rjsf/utils';
import { SelectWidget } from './SelectWidget';
import { RadioWidget } from './RadioWidget';
import { TextareaWidget } from './TextAreaWidget';
import { CheckBoxWidget } from './CheckboxWidget';
import { ItemWidget } from './ItemWidget';

// UI names
export enum UIWidgets {
  item = 'item',
  radio = 'radio',
}

export const customWidgets: RegistryWidgetsType = {
  selectWidget: SelectWidget,
  radioWidget: RadioWidget,
  TextareaWidget: TextareaWidget,
  checkbox: CheckBoxWidget,
  item: ItemWidget,
};
