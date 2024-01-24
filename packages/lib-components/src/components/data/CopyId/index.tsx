import { FC, useEffect, useState } from 'react';
import { Chip } from '../../../components';
import { AiFillCopy as CopyIcon, AiOutlineCheck as CheckmarkIcon } from 'react-icons/ai';

export interface CopyIdProps {
  id?: string;
  placeholder?: string;
}

export const CopyId: FC<CopyIdProps> = ({ id, placeholder }) => {
  const [copied, setCopied] = useState<boolean>(false);

  function handleCopy(text: string) {
    setCopied(true);
    navigator.clipboard.writeText(text);
  }

  useEffect(() => {
    /* If it was copied, show a checkmark for 2.5s thn make it possible to copy again */
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  }, [copied]);

  if (!id) return <></>;

  return (
    <Chip
      icon={copied ? <CheckmarkIcon /> : <CopyIcon />}
      onClick={() => handleCopy(id)}
      variant="outline"
      label={copied ? 'copied' : placeholder ? placeholder : id}
      color="backgroundAccent"
    />
  );
};
