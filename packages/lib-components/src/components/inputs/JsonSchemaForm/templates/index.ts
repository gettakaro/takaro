import { TemplatesType } from '@rjsf/utils';
import { FieldTemplate } from './FieldTemplate';
import { FieldErrorTemplate } from './FieldErrorTemplate';
import { SubmitButton } from './SubmitButton';
import { AddButton } from './AddButton';
import { CopyButton, MoveUpButton, RemoveButton, MoveDownButton } from './IconButton';
import { DescriptionFieldTemplate } from './DescriptionFieldTemplate';
import { ArrayFieldTemplate } from './ArrayFieldTemplate';
import { ArrayFieldItemTemplate } from './ArrayFieldItemTemplate';
import { ObjectFieldTemplate } from './ObjectFieldTemplate';
import { TitleFieldTemplate } from './TitleFieldTemplate';

export const customTemplates: Partial<TemplatesType> = {
  FieldTemplate,
  FieldErrorTemplate,
  ArrayFieldTemplate,
  ArrayFieldItemTemplate,
  DescriptionFieldTemplate,
  ButtonTemplates: {
    SubmitButton,
    AddButton,
    CopyButton,
    RemoveButton,
    MoveUpButton,
    MoveDownButton,
  },
  ObjectFieldTemplate,
  TitleFieldTemplate,
};
