import { FC } from 'react';
import { IconButton } from '..';
import { Size } from '../../../styled';
import { AiOutlineQuestion } from 'react-icons/ai';
import { Tooltip} from '../../../components';

export interface SupportButtonProps {
  size?: Size;
  message: string;
}

export const SupportButton: FC<SupportButtonProps> = ({ size = 'medium', message }) => {
  return (
    <Tooltip label={message}>
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
