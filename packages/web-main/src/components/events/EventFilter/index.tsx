import { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, Divider, Popover, Select, TextField } from '@takaro/lib-components';
import { HiFunnel as FilterIcon } from 'react-icons/hi2';
import { ButtonContainer, FilterContainer, FilterContent, OperatorSelect } from './style';
import { Filter as FilterType } from 'pages/Events';

enum operators {
  is = 'is',
  contains = 'contains',
}

type FormInputs = {
  filter: {
    field: string;
    operator: string;
    value: string;
  };
};

type FilterProps = {
  addFilter: (filter: FilterType) => void;
  removeFilter: (filter: FilterType) => void;
};

export const EventFilter: FC<FilterProps> = ({ addFilter }) => {
  const [open, setOpen] = useState<boolean>(false);

  const fieldNames = ['gameserver', 'player', 'message', 'success', 'module'];

  const { control, handleSubmit } = useForm<FormInputs>({
    mode: 'onSubmit',
    shouldUnregister: true,
  });

  const onSubmit: SubmitHandler<FormInputs> = ({ filter }) => {
    addFilter(filter);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom-end">
      <Popover.Trigger asChild>
        <Button icon={<FilterIcon />} text="New filter" onClick={() => setOpen(true)} />
      </Popover.Trigger>
      <Popover.Content>
        <FilterContent>
          <h3>Add filter</h3>
          <Divider fullWidth />
          <form onSubmit={handleSubmit(onSubmit)}>
            <FilterContainer hasMultipleFields={false}>
              <Select
                control={control}
                name="filter.field"
                inPortal
                render={(selectedIndex) => {
                  return fieldNames[selectedIndex] ?? 'Select a field';
                }}
              >
                <Select.OptionGroup>
                  {fieldNames.map((col) => (
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
              <TextField control={control} name="filter.value" placeholder="Enter a value" />
            </FilterContainer>

            <ButtonContainer>
              <Button text="Cancel" type="reset" variant="clear" onClick={() => setOpen(false)} />
              <Button type="submit" text="Add filter" />
            </ButtonContainer>
          </form>
        </FilterContent>
      </Popover.Content>
    </Popover>
  );
};
