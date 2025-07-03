import { Card, styled } from '@takaro/lib-components';
import { InnerBody } from './style';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { FC } from 'react';

const AddCardInnerBody = styled(InnerBody)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface AddCardProps {
  onClick: () => void;
  title: string;
  disabled?: boolean;
}

export const AddCard: FC<AddCardProps> = ({ onClick, title, disabled }) => {
  return (
    <Card role="link" onClick={onClick} variant="outline" disabled={disabled}>
      <Card.Body>
        <AddCardInnerBody>
          <PlusIcon size={24} />
          <h3>{title}</h3>
        </AddCardInnerBody>
      </Card.Body>
    </Card>
  );
};
