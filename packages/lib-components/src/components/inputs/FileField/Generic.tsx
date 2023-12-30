import { forwardRef, useCallback, useRef } from 'react';
import { InputContainer, ContentContainer } from './style';
import { Size } from '../../../styled';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';
import { setAriaDescribedBy } from '../layout';
import { IconButton } from '../../../components';
import { AiOutlineDelete as ClearIcon } from 'react-icons/ai';

function getFileNames(files: FileList) {
  return Array.from(files)
    .map((file) => file.name)
    .join(', ');
}

export interface FileFieldProps {
  placeholder?: string;
  size?: Size;
  // TODO: Add multiple file selection
  multiple?: boolean;
}

export type GenericFileFieldProps = GenericInputProps<string, HTMLInputElement> & FileFieldProps;

const defaultsApplier = defaultInputPropsFactory<GenericFileFieldProps>(defaultInputProps);

export const GenericFileField = forwardRef<HTMLInputElement, GenericFileFieldProps>((props, ref) => {
  // TODO: clean up this incorrect type cast mess
  const value = props.value as unknown as FileList;

  const {
    onChange,
    onBlur = () => {},
    onFocus = () => {},
    name,
    disabled,
    required,
    readOnly,
    hasError,
    multiple = false,
    placeholder = 'Choose file...',
    id,
    hasDescription,
  } = defaultsApplier(props);

  value as unknown as FileList;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      // Manually trigger the onChange handler
      if (onChange) {
        const fakeEvent = {
          currentTarget: {
            files: new DataTransfer().files,
          },
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onChange(fakeEvent);
      }
    }
  }, [inputRef, multiple]);

  const handleFileChange = useCallback(
    (e: any) => {
      onChange(e.currentTarget.files);
    },
    [onChange, multiple]
  );

  return (
    <InputContainer>
      <input
        type="file"
        aria-hidden="true"
        style={{ position: 'absolute', pointerEvents: 'none', opacity: 0, margin: 0 }}
        id={`${id}-hidden-file-field`}
        multiple={multiple}
        tabIndex={-1}
        onChange={handleFileChange}
        ref={inputRef}
      />

      <ContentContainer
        role="button"
        aria-required={required}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
        hasError={hasError}
        tabIndex={readOnly || disabled ? -1 : 0}
        ref={ref}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={() => inputRef.current?.click()}
      >
        <span>{value && value.length > 0 ? getFileNames(value) : placeholder}</span>
        {value && value.length > 0 && (
          <IconButton
            icon={<ClearIcon />}
            ariaLabel="Remove files"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </ContentContainer>
    </InputContainer>
  );
});
