import { TemplatesType } from '@rjsf/utils';
import { FieldTemplate } from './FieldTemplate';
import { FieldErrorTemplate } from './FieldErrorTemplate';
import { SubmitButton } from './SubmitButton';
import { AddButton } from './AddButton';

export const customTemplates: Partial<TemplatesType> = {
  FieldTemplate,
  FieldErrorTemplate,
  ButtonTemplates: {
    SubmitButton,
    AddButton,
    CopyButton: () => null,
    RemoveButton: () => null,
    MoveUpButton: () => null,
    MoveDownButton: () => null,
  },
};
