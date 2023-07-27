import {
  isUiNodeInputAttributes,
  isUiNodeTextAttributes,
  isUiNodeImageAttributes,
  isUiNodeAnchorAttributes,
  getNodeLabel,
  isUiNodeScriptAttributes,
} from '@ory/integrations/ui';
import {
  UiNode,
  UiNodeInputAttributes,
  UiNodeTextAttributes,
  UiNodeImageAttributes,
  UiNodeScriptAttributes,
} from '@ory/client';
import { Control, FieldValues } from 'react-hook-form';
import { Button, CheckBox, TextField } from '../../components';
import { NodeScript } from './NodeScript';
import { NodeImage } from './NodeImage';
import { NodeText } from './NodeText';
import { NodeHidden } from './NodeHidden';

export const mapUINode = (node: UiNode, key: number, control: Control<FieldValues> | Control<any>) => {
  // Nodes of type text are commonly used to display secrets (e.g. lookup secrets).
  if (isUiNodeTextAttributes(node.attributes)) {
    const attrs = node.attributes as UiNodeTextAttributes;
    return <NodeText node={node} attributes={attrs} />;
  }

  if (isUiNodeImageAttributes(node.attributes)) {
    const attrs = node.attributes as UiNodeImageAttributes;
    return <NodeImage node={node} attributes={attrs} />;
  }

  if (isUiNodeScriptAttributes(node.attributes)) {
    const attrs = node.attributes as UiNodeScriptAttributes;
    return <NodeScript node={node} attributes={attrs} />;
  }

  // these are not used by ory atm
  // https://www.ory.sh/docs/kratos/concepts/ui-user-interface#ui-anchor-nodes
  if (isUiNodeAnchorAttributes(node.attributes)) {
  }

  // if (isUiNodeAnchorAttributes(node.attributes)) {
  if (isUiNodeInputAttributes(node.attributes)) {
    const attrs = node.attributes as UiNodeInputAttributes;
    const nodeType = attrs.type;
    const messages = node.messages.map((m) => m.text).join(' ');
    const label = getNodeLabel(node);

    switch (nodeType) {
      case 'button':
      case 'submit':
        return (
          <Button
            type={attrs.type as 'submit' | 'reset' | 'button' | undefined}
            disabled={attrs.disabled}
            text={label}
          />
        );
      case 'email':
        return (
          <TextField
            disabled={attrs.disabled}
            control={control}
            name={attrs.name}
            type="email"
            required={attrs.required}
            label={label}
            description={messages}
          />
        );
      case 'password':
        return (
          <TextField
            disabled={attrs.disabled}
            control={control}
            name={attrs.name}
            type="password"
            required={attrs.required}
            label={label}
            description={messages}
          />
        );
      case 'checkbox':
        return (
          <CheckBox
            disabled={attrs.disabled}
            label={label}
            control={control}
            name={attrs.name}
            required={attrs.required}
            description={messages}
          />
        );
      case 'hidden':
        return <NodeHidden node={node} attributes={attrs} control={control} />;
    }
  }
};
