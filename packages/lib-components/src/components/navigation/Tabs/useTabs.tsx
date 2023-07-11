import { useEffect, useState } from 'react';

interface TabsOptions {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  // activitationMode: 'automatic' | 'manual';
}

export function useTabs({ defaultValue = '', onValueChange }: TabsOptions) {
  const [value, setValue] = useState<string>(defaultValue);
  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  useEffect(() => {
    if (onValueChange) {
      onValueChange(value);
    }
  }, [value]);

  return {
    value,
    setValue,
    labelId,
    descriptionId,
    setLabelId,
    setDescriptionId,
  };
}
