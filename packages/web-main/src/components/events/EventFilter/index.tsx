import { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, Divider, Popover, SearchField, Select } from '@takaro/lib-components';
import { HiFunnel as FilterIcon } from 'react-icons/hi2';
import { ButtonContainer, FilterContainer, Box, OperatorSelect } from './style';
import { Filter, Operator } from '../types';

type FormInputs = {
  filter: Filter;
};

type EventFilterProps = {
  mode: 'add' | 'edit';
  fields: string[];
  getValueOptions?: (field: string) => string[];
  selectedFilter?: Filter;
  addFilter: (filter: Filter) => void;
};

type FilterPopupProps = EventFilterProps & {
  setOpen: (open: boolean) => void;
};

export const FilterPopup: FC<FilterPopupProps> = ({
  selectedFilter,
  fields,
  addFilter,
  mode,
  setOpen,
  getValueOptions,
}) => {
  const [options, setOptions] = useState<string[]>([]);

  const { control, handleSubmit, getValues } = useForm<FormInputs>({
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
    const copyFilter = { ...filter };

    copyFilter.operator = Operator[filter.operator];

    addFilter(copyFilter);
    setOpen(false);
  };

  const handleInputValueChange = (value: string) => {
    if (getValueOptions) {
      const options = getValueOptions(getValues().filter.field);
      setOptions(options.filter((option) => option.toLowerCase().includes(value.toLowerCase())));
    }
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
              return Object.keys(Operator)[selectedIndex] ?? 'select operator';
            }}
          >
            <Select.OptionGroup>
              {Object.keys(Operator).map((operator) => (
                <Select.Option key={operator} value={operator}>
                  <div>
                    <span>{operator}</span>
                  </div>
                </Select.Option>
              ))}
            </Select.OptionGroup>
          </OperatorSelect>
          <SearchField
            debounce={0}
            control={control}
            name="filter.value"
            placeholder="Select a value"
            handleInputValueChange={handleInputValueChange}
          >
            {/* In this case the label is the same as the value but ofcourse that can differ*/}
            <SearchField.OptionGroup>
              {options?.map((name) => (
                <SearchField.Option key={name} value={name} label={name}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{name}</span>
                  </div>
                </SearchField.Option>
              ))}
            </SearchField.OptionGroup>
          </SearchField>
        </FilterContainer>

        <ButtonContainer>
          <Button text="Cancel" type="reset" variant="clear" onClick={() => setOpen(false)} />
          <Button type="submit" text={`${mode} Filter`} />
        </ButtonContainer>
      </form>
    </Box>
  );
};

export const EventFilter: FC<EventFilterProps> = ({ fields, addFilter, getValueOptions }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom-end">
      <Popover.Trigger asChild>
        <Button icon={<FilterIcon />} text="Filter" onClick={() => setOpen(true)} />
      </Popover.Trigger>
      <Popover.Content>
        <FilterPopup
          fields={fields}
          addFilter={addFilter}
          mode="add"
          setOpen={setOpen}
          getValueOptions={getValueOptions}
        />
      </Popover.Content>
    </Popover>
  );
};
