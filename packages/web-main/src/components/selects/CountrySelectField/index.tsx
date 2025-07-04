import { SelectField, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '..';
import { countryCodes } from './countryCodes';

const Inner = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const Flag = styled.img`
  width: 1.5rem;
  height: 1.5rem;
`;

export type CountrySelectProps = CustomSelectProps;

export const CountrySelectField: FC<CountrySelectProps> = ({
  label = 'Countries',
  control,
  name: selectName,
  hint,
  size,
  loading,
  disabled,
  readOnly,
  canClear = true,
  multiple,
  required,
  description,
}) => {
  return (
    <SelectField
      label={label}
      control={control}
      name={selectName}
      hint={hint}
      canClear={canClear}
      multiple={multiple}
      enableFilter
      loading={loading}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      description={description}
      size={size}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>{multiple ? 'Select countries' : 'Select country'}</div>;
        }
        return <div>{multiple ? selectedItems.map((item) => item.label).join(', ') : selectedItems[0].label}</div>;
      }}
    >
      <SelectField.OptionGroup>
        {countryCodes.map(({ name, code }) => (
          <SelectField.Option key={`${selectName}-${name}`} value={code} label={name}>
            <Inner>
              <Flag
                alt={`Flag of ${name}`}
                src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
              />
              <span>{name}</span>
            </Inner>
          </SelectField.Option>
        ))}
      </SelectField.OptionGroup>
    </SelectField>
  );
};
