import { styled } from '@takaro/lib-components';
import { FC } from 'react';
import { HiXMark as CloseIcon } from 'react-icons/hi2';

const Wrapper = styled.div`
  display: flex;
  width: fit-content;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  justify-content: space-between;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['0_75']}`};

  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const Operator = styled.p`
  font-weight: 600;
`;

const Label = styled.div`
  display: flex;
  width: fit-content;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};

  &:hover {
    cursor: pointer;
    border-bottom: 1px solid ${({ theme }) => theme.colors.textAlt};
  }
`;

type FilterTagProps = {
  field: string;
  operator: string;
  value: string;
  onClear: () => void;
  onClick: () => void;
};

const operatorMap = {
  ':': '=',
  '>': 'greater than',
  '<': 'less than',
  '>=': 'greater than or equal to',
  '<=': 'less than or equal to',
  '!=': 'not equal to',
  in: 'in',
  is: ':',
  'not in': 'not in',
  contains: 'contains',
  'not contains': 'not contains',
  'starts with': 'starts with',
  'not starts with': 'not starts with',
  'ends with': 'ends with',
  'not ends with': 'not ends with',
};

export const EventFilterTag: FC<FilterTagProps> = ({ field, operator, value, onClear }) => {
  return (
    <Wrapper>
      <Label>
        <p>{field}</p>
        <Operator>{operatorMap[operator]}</Operator>
        <p>{value}</p>
      </Label>
      <CloseIcon onClick={onClear} style={{ cursor: 'pointer' }} />
    </Wrapper>
  );
};
