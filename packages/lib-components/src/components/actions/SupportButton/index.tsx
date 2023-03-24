import { FC } from 'react';
import { IconButton } from '..';
import { Size } from '../../../styled';
import { AiOutlineQuestion } from 'react-icons/ai';
import { Tooltip } from '../../../components';
import { Placement } from '@floating-ui/react';

export interface SupportButtonProps {
  size?: Size;
  message: string;
  placement?: Placement;
}

export const SupportButton: FC<SupportButtonProps> = ({
  size = 'medium',
  message,
  placement = 'top',
}) => {
  return (
    <Tooltip label={message} placement={placement}>
      <div>
        <IconButton
          color="secondary"
          icon={<AiOutlineQuestion size={24} />}
          onClick={() => {
            /**/
          }}
          size={size}
          variant="clear"
        />
      </div>
    </Tooltip>
  );
};

//<IconButton color="secondary" icon={<AiOutlineQuestion size={24}/>} onClick={() => { /**/ }} size={size} variant="clear" />
