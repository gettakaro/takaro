import { TemplatesType } from '@rjsf/utils';
import { FieldTemplate } from './FieldTemplate';
import { FieldErrorTemplate } from './FieldErrorTemplate';
import { SubmitButton } from './SubmitButton';
import { AddButton } from './AddButton';
import { DescriptionFieldTemplate } from './DescriptionFieldTemplate';

export const customTemplates: Partial<TemplatesType> = {
  FieldTemplate,
  FieldErrorTemplate,
  DescriptionFieldTemplate,
  ButtonTemplates: {
    SubmitButton,
    AddButton,
    CopyButton: () => null,
    RemoveButton: () => null,
    MoveUpButton: () => null,
    MoveDownButton: () => null,
  },
};
