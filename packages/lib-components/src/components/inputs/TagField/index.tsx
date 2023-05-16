import { forwardRef, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { InputProps } from '../InputProps';
import { ZodType } from 'zod';
import { Container, Tag } from './style';
import { Label } from '../Label';

const defaultSeparators = ['Enter'];

export interface GenericTagFieldProps extends InputProps {
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
    },
    ref
  ) => {
    const [tags, setTags] = useState<string[]>(value);

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

    return (
      <>
        {label && (
          <Label
            text={label}
            htmlFor={name}
            error={false}
            disabled={disabled}
            required={required}
            position="left"
            size="medium"
          />
        )}
        <Container aria-labelledby={name} ref={ref}>
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
          />
        </Container>
      </>
    );
  }
);

export function useDidUpdateEffect(fn, inputs) {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) fn();
    else didMountRef.current = true;
  }, inputs);
}
