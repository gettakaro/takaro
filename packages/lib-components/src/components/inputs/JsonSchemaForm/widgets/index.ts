import { RegistryWidgetsType } from '@rjsf/utils';
import { SelectWidget } from './SelectWidget';
import { RadioWidget } from './RadioWidget';
import { TextareaWidget } from './TextAreaWidget';
import { CheckBoxWidget } from './CheckboxWidget';

export const customWidgets: RegistryWidgetsType = {
  selectWidget: SelectWidget,
  radioWidget: RadioWidget,
  TextareaWidget: TextareaWidget,
  checkboxWidget: CheckBoxWidget,
};
