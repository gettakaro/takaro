import { forwardRef, KeyboardEvent, ClipboardEvent, useState, useEffect } from 'react';
import { GenericInputPropsFunctionHandlers } from '../InputProps';
import { ZodType } from 'zod';
import { TagsContainer, Tag } from './style';
import { splitPaste, useDidUpdateEffect } from './util';
import { setAriaDescribedBy } from '../layout';

const defaultSeparators = ['Enter'];

export interface TagFieldProps {
  onRemoved?: (tag: string) => void;
  tagValidationSchema?: ZodType<{ tags: string[] }, any, any>;
  separators?: string[];
  disableBackspaceRemove?: boolean;
  // When using backspace, the item itself is removed and the value is shown in the inputfield
  isEditOnRemove?: boolean;
  allowDuplicates?: boolean;
  placeholder?: string;
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

// these are props that should only be available on the generic version.
export type GenericTagFieldProps = TagFieldProps & GenericInputPropsFunctionHandlers<string[], HTMLInputElement>;

export const GenericTagField = forwardRef<HTMLDivElement, GenericTagFieldProps>(function GenericTagField(
  {
    onRemoved,
    separators = [],
    name,
    readOnly,
    placeholder,
    // TODO: tagValidationSchema,
    disableBackspaceRemove,
    value = [],
    onKeyUp,
    allowDuplicates = false,
    isEditOnRemove,
    disabled = false,
    onBlur = () => {},
    onFocus = () => {},
    onChange,
    required,
    hasDescription,
  },
  ref,
) {
  const combinedSeparators = [...defaultSeparators, ...separators];
  const [tags, setTags] = useState<string[]>(Array.isArray(value) ? value : []);

  useDidUpdateEffect(() => {
    onChange(tags);
  }, [tags]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const text = e.currentTarget.value;

    // handle tag removing
    if (!text && !disableBackspaceRemove && tags.length && e.key === 'Backspace') {
      e.currentTarget.value = isEditOnRemove ? `${tags.at(-1)} ` : '';
      setTags([...tags.slice(0, -1)]);
    }

    // handle new tag confirmation
    if (text && combinedSeparators.includes(e.key)) {
      e.preventDefault();

      // TODO: check tag validation logic
      // if (tagValidationSchema && tagValidationSchema.parse(tags)) return;

      if (tags.includes(text) && !allowDuplicates) {
        // should not add duplicate tags
        return;
      }

      setTags([...tags, text]);

      // clear input field
      e.currentTarget.value = '';
    }
  };

  useEffect(() => {
    // remove duplicates from tag list when allowDuplicates is set to false
    if (!allowDuplicates) {
      setTags([...new Set(tags)]);
    }
  }, [allowDuplicates]);

  const onTagDelete = (text: string) => {
    setTags(tags.filter((tag) => tag !== text));
    if (onRemoved) {
      onRemoved(text);
    }
  };

  const handleOnPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasteText = event.clipboardData.getData('text');
    if (pasteText.length < 1) return;

    const pasteTags = splitPaste({
      text: pasteText,
      tags,
      separators: combinedSeparators,
    });
    setTags([...tags, ...pasteTags]);
    event.preventDefault();
  };

  return (
    <TagsContainer aria-labelledby={name} ref={ref}>
      {tags.map((tag) => (
        <Tag
          key={tag}
          label={tag}
          onDelete={() => onTagDelete(tag)}
          disabled={disabled}
          readOnly={readOnly}
          color="secondary"
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
        onBlur={onBlur}
        onPaste={handleOnPaste}
        onFocus={onFocus}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
        aria-required={required}
      />
    </TagsContainer>
  );
});
