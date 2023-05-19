import { forwardRef, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { InputProps } from '../InputProps';
import { ZodType } from 'zod';
import { Container, TagsContainer, Tag } from './style';
import { ErrorMessage, Label } from '../../../components';

const defaultSeparators = ['Enter'];

export interface TagFieldProps extends InputProps {
  onRemoved?: (tag: string) => void;
  tagValidationSchema?: ZodType<{ tags: string[] }, any, any>;
  seperators?: string[];
  disableBackspaceRemove?: boolean;
  isEditOnRemove?: boolean;
  onExisting?: (tag: string) => void;
  placeholder?: string;
  onChange?: (tags: string[]) => void;
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
  value?: string[];
  description?: string;
}

// these are props that should only be available on the generic version.
export interface GenericTagFieldProps extends TagFieldProps {
  onChange: (...event: any[]) => unknown;
  onBlur: (...event: any[]) => unknown;
  error?: string;
}

export const GenericTagField = forwardRef<HTMLDivElement, GenericTagFieldProps>(
  (
    {
      onRemoved,
      seperators,
      name,
      readOnly,
      placeholder,
      label,
      // TODO: tagValidationSchema,
      disableBackspaceRemove,
      onChange,
      value = [],
      onKeyUp,
      onExisting,
      isEditOnRemove,
      disabled = false,
      required = false,
      description,
      error,
      onBlur,
      hint,
    },
    ref
  ) => {
    const [tags, setTags] = useState<string[]>(value);
    const [showError, setShowError] = useState(false);

    useDidUpdateEffect(() => {
      onChange && onChange(tags);
    }, [tags]);

    useDidUpdateEffect(() => {
      if (JSON.stringify(value) !== JSON.stringify(tags)) {
        setTags(value);
      }
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const text = e.currentTarget.value;

      // handle tag removing
      if (
        !text &&
        !disableBackspaceRemove &&
        tags.length &&
        e.key === 'Backspace'
      ) {
        e.currentTarget.value = isEditOnRemove ? `${tags.at(-1)} ` : '';
        setTags([...tags.slice(0, -1)]);
      }

      // handle new tag confirmation
      if (text && (seperators || defaultSeparators).includes(e.key)) {
        e.preventDefault();

        // TODO: check tag validation logic
        // if (tagValidationSchema && tagValidationSchema.parse(tags)) return;

        if (tags.includes(text)) {
          onExisting && onExisting(text);
          return;
        }

        setTags([...tags, text]);

        // clear input field
        e.currentTarget.value = '';
      }
    };

    const onTagDelete = (text: string) => {
      setTags(tags.filter((tag) => tag !== text));
      onRemoved && onRemoved(text);
    };

    const handleOnBlur = () => {
      onBlur();
      setShowError(false);
    };

    return (
      <Container>
        {label && (
          <Label
            text={label}
            htmlFor={name}
            error={false}
            disabled={disabled}
            required={required}
            position="top"
            size="medium"
            hint={hint}
          />
        )}
        <TagsContainer aria-labelledby={name} ref={ref}>
          {tags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              onDelete={() => onTagDelete(tag)}
              disabled={disabled}
            />
          ))}
          <input
            type="text"
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onKeyUp={onKeyUp}
            readOnly={readOnly}
            onBlur={handleOnBlur}
          />
        </TagsContainer>
        {description && <p>{description}</p>}
        {error && showError && <ErrorMessage message={error} />}
      </Container>
    );
  }
);

export function useDidUpdateEffect(fn: () => unknown, inputs: unknown[]) {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) fn();
    else didMountRef.current = true;
  }, inputs);
}
