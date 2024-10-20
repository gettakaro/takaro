import { TemplatesType } from '@rjsf/utils';
import { FieldTemplate } from './FieldTemplate';
import { FieldErrorTemplate } from './FieldErrorTemplate';
import { SubmitButton } from './SubmitButton';
import { AddButton } from './AddButton';
import { CopyButton, MoveUpButton, RemoveButton, MoveDownButton } from './IconButton';
import { DescriptionFieldTemplate } from './DescriptionFieldTemplate';
import { ArrayFieldTemplate } from './ArrayFieldTemplate';
import { ArrayFieldItemTemplate } from './ArrayFieldItemTemplate';
import { ArrayFieldTitleTemplate } from './ArrayFieldTitleTemplate';
import { ArrayFieldDescriptionTemplate } from './ArrayFieldDescriptionTemplate';
import { ObjectFieldTemplate } from './ObjectFieldTemplate';
import { TitleFieldTemplate } from './TitleFieldTemplate';
import { BaseInputTemplate } from './BaseInputTemplate';

export const customTemplates: Partial<TemplatesType> = {
  BaseInputTemplate,
  FieldTemplate,
  FieldErrorTemplate,
  ArrayFieldTemplate,
  ArrayFieldTitleTemplate,
  ArrayFieldDescriptionTemplate,
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
