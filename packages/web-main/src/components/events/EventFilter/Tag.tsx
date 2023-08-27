import { Popover, styled, Tooltip } from '@takaro/lib-components';
import { FC, useState } from 'react';
import { HiXMark as CloseIcon } from 'react-icons/hi2';
import { FilterPopup } from '.';
import { Filter as FilterType } from '../types';

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

const Label = styled.div`
  display: flex;
  width: fit-content;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};

  &:hover {
    cursor: pointer;
    border-bottom: 1px solid ${({ theme }) => theme.colors.textAlt};
  }
`;

type FilterTagProps = {
  fields: string[];
  filter: FilterType;
  editFilter: (filter: FilterType) => void;
  onClear: () => void;
  onClick: () => void;
};

export const EventFilterTag: FC<FilterTagProps> = ({ filter, fields, editFilter, onClear, onClick }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
    onClick();
  };

  return (
    <Popover open={open} onOpenChange={setOpen} placement="right">
      <Popover.Trigger asChild>
        <Wrapper>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Label onClick={handleClick}>
                <p>{`${filter.field} ${filter.operator} ${filter.value}`}</p>
              </Label>
            </Tooltip.Trigger>
            <Tooltip.Content>Edit filter</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <CloseIcon onClick={onClear} style={{ cursor: 'pointer' }} />
            </Tooltip.Trigger>
            <Tooltip.Content>Delete filter</Tooltip.Content>
          </Tooltip>
        </Wrapper>
      </Popover.Trigger>
      <Popover.Content>
        <FilterPopup selectedFilter={filter} fields={fields} addFilter={editFilter} mode="edit" setOpen={setOpen} />
      </Popover.Content>
    </Popover>
  );
};
