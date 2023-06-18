import { RegistryFieldsType } from '@rjsf/utils';
import { BooleanField } from './BooleanField';
import { NumberField } from './NumberField';
import { StringField } from './StringField';
import { ArrayField } from './ArrayField';

/* Rjsf `Widgets` represent only the <HTML tag>. This does not include surrounding labels, descriptions and errors..
 * Rjsf `Fields` INCLUDE these. Since our components already expect these props, we should only create fields.
 **/

export const customFields: RegistryFieldsType = {
  StringField: StringField,
  BooleanField: BooleanField,
  NumberField: NumberField,
  ArrayField: ArrayField,
};
