import { RegistryFieldsType } from '@rjsf/utils';
import { BooleanField } from './BooleanField';
import { StringField } from './StringField';

/* Rjsf `Widgets` represent only the <HTML tag>. This does not include surrounding labels, descriptions and errors..
 * Rjsf `Fields` INCLUDE these. Since our components already expect these props, we should only create fields.
 **/

export const customFields: RegistryFieldsType = {
  StringField: StringField,
  BooleanField: BooleanField,
};
