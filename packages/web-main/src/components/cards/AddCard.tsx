import { Card, styled } from '@takaro/lib-components';
import { CardBody } from './style';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { FC } from 'react';

const AddCardBody = styled(CardBody)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface AddCardProps {
  onClick: () => void;
  title: string;
}

export const AddCard: FC<AddCardProps> = ({ onClick, title }) => {
  return (
    <Card onClick={onClick} variant="outline">
      <AddCardBody>
        <PlusIcon size={24} />
        <h3>{title}</h3>
      </AddCardBody>
    </Card>
  );
};
