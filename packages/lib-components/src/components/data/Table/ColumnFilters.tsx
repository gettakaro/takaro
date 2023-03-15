import { FC, useRef, useState } from 'react';
import {
  useFloating,
  offset,
  useInteractions,
  useRole,
  useClick,
  useDismiss,
  useListNavigation,
  autoUpdate,
  useMergeRefs,
  useFocus,
} from '@floating-ui/react';
import { styled } from '../../../styled';
import { ColumnFilter } from '@tanstack/react-table';
import { Button, TextField } from '../../../components';
import { AiOutlinePlus as Plus } from 'react-icons/ai';
import { useForm } from 'react-hook-form';

const ColumnList = styled.ul`
  background-color: white;
  width: fit-content;
  border-radius: 1rem;
`;

const ColumnListItem = styled.li<{ isSelected: boolean }>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.background : 'none'};
  padding: 0.5rem;
  margin: 0 0.5rem;
  cursor: pointer;
`;

const FilterContainer = styled.div`
  width: 300px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[3]};
  box-shadow: ${({ theme }) => theme.elevation[3]};
  border-radius: 1rem;
  div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`;

export interface ColumnFiltersProps {
  // id and value
  columnFilterState: ColumnFilter[];
  columns: string[];
}

export const ColumnFilters: FC<ColumnFiltersProps> = ({ columns }) => {
  const [open, setOpen] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { control } = useForm();
  const listRef = useRef<any>([]);

  const columnList = useFloating<HTMLButtonElement>({
    open,
    onOpenChange: setOpen,
    placement: 'bottom',
    middleware: [offset({ mainAxis: 2 })],
    whileElementsMounted: autoUpdate,
  });

  const columnListInteractions = useInteractions([
    useRole(columnList.context, { role: 'listbox' }),
    useListNavigation(columnList.context, {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
    }),
    useDismiss(columnList.context),
    useClick(columnList.context),
    useFocus(columnList.context),
  ]);

  const filter = useFloating<HTMLUListElement>({
    open,
    onOpenChange: setOpen,
    placement: 'right-start',
    middleware: [offset({ mainAxis: 5 })],
    whileElementsMounted: autoUpdate,
  });

  const filterInteractions = useInteractions([
    useRole(filter.context, { role: 'dialog' }),
    useDismiss(filter.context),
  ]);

  const columnListRef = useMergeRefs([
    columnList.refs.setFloating,
    filter.refs.setReference,
  ]);

  return (
    <>
      <Button
        ref={columnList.refs.setReference}
        {...columnListInteractions.getReferenceProps()}
        icon={<Plus />}
        text="Add filter"
        color="background"
      />
      {open && (
        <ColumnList
          ref={columnListRef}
          style={{
            position: columnList.strategy,
            top: columnList.y ?? 0,
            left: columnList.x ?? 0,
          }}
          {...columnListInteractions.getFloatingProps()}
          {...filterInteractions.getReferenceProps()}
        >
          {columns.map((id, index) => (
            <ColumnListItem
              key={`column-${id}`}
              ref={(node) => (listRef.current[index] = node)}
              tabIndex={activeIndex === index ? 0 : -1}
              isSelected={activeIndex === index}
              aria-selected={activeIndex === index}
              data-selected={activeIndex === index}
              {...columnListInteractions.getItemProps()}
              onClick={() => {
                setSelectedIndex(index);
              }}
            >
              {id}
            </ColumnListItem>
          ))}
        </ColumnList>
      )}
      {selectedIndex !== null && open && (
        <FilterContainer
          ref={filter.refs.setFloating}
          style={{
            position: filter.strategy,
            top: filter.y ?? 0,
            left: filter.x ?? 0,
          }}
          {...filterInteractions.getFloatingProps()}
        >
          <TextField name="filter-input" placeholder="" control={control} />
          <div>
            <Button text="Cancel" color="secondary" variant="default" />
            <Button text="Apply Filter" color="primary" />
          </div>
        </FilterContainer>
      )}
    </>
  );
};

/*
*      {
        <FilterList>
          {columnFilterState.map(({ id, value }) => (
            <li>
              <Chip label={`${id} is ${value}`} />
            </li>
          ))}
        </FilterList>
      }
*
* */
