import { FC } from 'react';
import {
  AiOutlineArrowUp as AscendingIcon,
  AiOutlineArrowDown as DescendingIcon,
} from 'react-icons/ai';
import { styled } from '../../../../styled';
import { OnChangeFn, SortingState } from '@tanstack/react-table';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
`;

interface SortDropdownProps {
  setSorting: OnChangeFn<SortingState>;
  sorting: SortingState;
  id: string;
  header: string;
}

export const Sorting: FC<SortDropdownProps> = ({
  id,
  setSorting,
  sorting,
  header,
}) => {
  const handleSortClick = () => {
    setSorting((old) => {
      const exists = old.find((o) => o.id === id);
      if (exists) {
        if (!exists.desc) {
          return [{ id, desc: true }];
        }
        return [];
      }
      return [{ id, desc: false }];
    });
  };

  const isDesc = () => {
    if (sorting.length > 0 && sorting[0].id === id && sorting[0].desc) {
      return true;
    }
    return false;
  };

  return (
    <Wrapper>
      <div onClick={handleSortClick}>{header}</div>
      {isDesc() &&
        sorting[0].id === id &&
        (sorting[0].desc ? <DescendingIcon /> : <AscendingIcon />)}
    </Wrapper>
  );
};
