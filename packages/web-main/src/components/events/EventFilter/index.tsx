import { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, Divider, Popover, Select, TextField } from '@takaro/lib-components';
import { HiFunnel as FilterIcon } from 'react-icons/hi2';
import { ButtonContainer, FilterContainer, Box, OperatorSelect } from './style';
import { Filter, operators } from '../types';

type FormInputs = {
  filter: Filter;
};

type EventFilterProps = {
  mode: 'add' | 'edit';
  fields: string[];
  selectedFilter?: Filter;
  addFilter: (filter: Filter) => void;
};

type FilterPopupProps = EventFilterProps & {
  setOpen: (open: boolean) => void;
};

export const FilterPopup: FC<FilterPopupProps> = ({ selectedFilter, fields, addFilter, mode, setOpen }) => {
  const { control, handleSubmit } = useForm<FormInputs>({
    mode: 'onSubmit',
    shouldUnregister: true,
    ...(selectedFilter && {
      defaultValues: {
        filter: {
          field: selectedFilter.field,
          operator: selectedFilter.operator,
          value: selectedFilter.value,
        },
      },
    }),
  });

  const onSubmit: SubmitHandler<FormInputs> = ({ filter }) => {
    addFilter(filter);
    setOpen(false);
  };

  return (
    <Box>
      <h3 style={{ textTransform: 'capitalize' }}>{mode} filter</h3>
      <Divider fullWidth />
      <form onSubmit={handleSubmit(onSubmit)}>
        <FilterContainer hasMultipleFields={false}>
          <Select
            control={control}
            name="filter.field"
            inPortal
            render={(selectedIndex) => {
              if (selectedFilter) return selectedFilter.field;
              return fields[selectedIndex] ?? 'Select a field';
            }}
          >
            <Select.OptionGroup>
              {fields.map((col) => (
                <Select.Option key={col} value={col}>
                  <div>
                    <span>{col}</span>
                  </div>
                </Select.Option>
              ))}
            </Select.OptionGroup>
          </Select>

          <OperatorSelect
            control={control}
            name="filter.operator"
            inPortal
            render={(selectedIndex) => {
              return Object.keys(operators)[selectedIndex] ?? 'select operator';
            }}
          >
            <Select.OptionGroup>
              {Object.keys(operators).map((operator) => (
                <Select.Option key={operator} value={operator}>
                  <div>
                    <span>{operator}</span>
                  </div>
                </Select.Option>
              ))}
            </Select.OptionGroup>
          </OperatorSelect>
          <TextField control={control} name="filter.value" placeholder="Select a value" />
        </FilterContainer>

        <ButtonContainer>
          <Button text="Cancel" type="reset" variant="clear" onClick={() => setOpen(false)} />
          <Button type="submit" text={`${mode} Filter`} />
        </ButtonContainer>
      </form>
    </Box>
  );
};

export const EventFilter: FC<EventFilterProps> = ({ fields, addFilter }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom-end">
      <Popover.Trigger asChild>
        <Button icon={<FilterIcon />} text="Filter" onClick={() => setOpen(true)} />
      </Popover.Trigger>
      <Popover.Content>
        <FilterPopup fields={fields} addFilter={addFilter} mode="add" setOpen={setOpen} />
      </Popover.Content>
    </Popover>
  );
};
