import { useEffect, useRef } from 'react';

export function useDidUpdateEffect(fn: () => unknown, inputs: unknown[]) {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) fn();
    else didMountRef.current = true;
  }, inputs);
}

type splitPasteParamType = {
  tags: Array<string>;
  text: string;
  separators: Array<string>;
};

export function splitPaste({ tags, text, separators }: splitPasteParamType) {
  const dirtyTags: string[] = separators.reduce(
    (accumulator: string[], separator) => {
      const splitText = text.split(separator);
      if (splitText.length > accumulator.length) accumulator = splitText;
      return accumulator;
    },
    []
  );
  const cleanTags = dirtyTags.map((tag) => tag.trim());

  const cleanDuplicateTags = cleanTags.reduce((accumulator: string[], tag) => {
    if (!tags.includes(tag)) {
      accumulator.push(tag);
    }
    return accumulator;
  }, []);

  return cleanDuplicateTags;
}
