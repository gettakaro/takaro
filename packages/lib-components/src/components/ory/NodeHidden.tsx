import { UiNode, UiNodeInputAttributes } from '@ory/client';
import { FC } from 'react';
import { Control, FieldValues, useController } from 'react-hook-form';

interface NodeHiddenProps {
  node: UiNode;
  attributes: UiNodeInputAttributes;
  control: Control<FieldValues> | Control<any>;
}

export const NodeHidden: FC<NodeHiddenProps> = ({ attributes, control }) => {
  const { field } = useController({
    control,
    name: attributes.name,
    defaultValue: attributes.value,
  });

  return <input type="hidden" name={attributes.name} value={field.value} />;
};
