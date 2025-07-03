import { IconButton, Tooltip } from '@takaro/lib-components';
import { AnchorHTMLAttributes, FC } from 'react';
import { AiOutlineBook as DocumentationIcon } from 'react-icons/ai';

export const DocsLink: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = (props) => {
  return (
    <a {...props}>
      <Tooltip>
        <Tooltip.Trigger>
          <IconButton icon={<DocumentationIcon size={18} />} ariaLabel="link to documentation" />
        </Tooltip.Trigger>
        <Tooltip.Content>Read more in takaro's documentation</Tooltip.Content>
      </Tooltip>
    </a>
  );
};
