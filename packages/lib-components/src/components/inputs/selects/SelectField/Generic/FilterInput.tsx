import { forwardRef, useState } from 'react';
import { GenericTextField } from '../../../TextField';
import { AiOutlineSearch as SearchIcon } from 'react-icons/ai';
import { styled } from '../../../../../styled';

const Container = styled.div`
  input {
    background-color: ${({ theme }) => theme.colors.background};
  }
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing['1']};
  }
  padding-bottom: ${({ theme }) => theme.spacing['0_75']};
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
`;

interface FilterInputProps {
  selectName: string;
  onFilterChange: (value: string) => void;
}

export const FilterInput = forwardRef<HTMLInputElement, FilterInputProps>(function FilterInput(
  { selectName, onFilterChange },
  ref,
) {
  const [inputValue, setInputValue] = useState<string>('');
  const onChangeHandler = (value: string) => {
    setInputValue(value);
    onFilterChange(value);
  };

  return (
    <Container>
      <GenericTextField
        ref={ref}
        id={`select-${selectName}`}
        name={`select-${selectName}`}
        hasDescription={false}
        icon={<SearchIcon />}
        placeholder="Filter Options"
        value={inputValue}
        onChange={(e) => onChangeHandler(e.target.value)}
        size="tiny"
        hasError={false}
      />
    </Container>
  );
});
