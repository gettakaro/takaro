import { FC, useState, useEffect } from 'react';
import { styled } from '../../../styled';
import { AiOutlineCopy as CopyIcon, AiOutlineCheck as CheckmarkIcon } from 'react-icons/ai';
import { useSnackbar } from 'notistack';

const Container = styled.div<{ maxWidth: number | undefined; copied: boolean }>`
  position: relative;
  padding: ${({ theme }) => theme.spacing[0]};
  outline: 0;
  width: fit-content;

  input {
    width: ${({ maxWidth }): string => `${maxWidth}px`};
    padding: ${({ theme }) =>
      `${theme.spacing['0_75']} ${theme.spacing[4]} ${theme.spacing['0_75']} ${theme.spacing['0_75']}`};
    border: 0.1rem solid ${({ copied, theme }): string => (copied ? theme.colors.primary : theme.colors.background)};
    color: ${({ theme, copied }): string => (copied ? theme.colors.primary : theme.colors.text)};
    cursor: default;

    &:hover {
      cursor: default;
    }
  }
`;

const IconContainer = styled.div<{ copied: boolean }>`
  position: absolute;
  top: 7px;
  right: 7px;

  svg {
    fill: ${({ copied, theme }): string => (copied ? theme.colors.primary : theme.colors.background)};
    stroke: ${({ copied, theme }): string => (copied ? theme.colors.primary : theme.colors.background)};
    cursor: pointer;
  }
`;

export interface ClipBoardProps {
  text: string;
  maxWidth?: number;
}

export const ClipBoard: FC<ClipBoardProps> = ({ text, maxWidth = 200 }) => {
  const [copied, setCopied] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  function handleCopy() {
    setCopied(true);
    navigator.clipboard.writeText(text);
  }

  useEffect(() => {
    /* If it was copied, show a checkmark for 2.5s thn make it possible to copy again */
    if (copied) {
      enqueueSnackbar('Copied to clipboard', { variant: 'default' });
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  }, [copied]);

  return (
    <Container copied={copied} maxWidth={maxWidth} role="button" tabIndex={-1}>
      <input aria-describedby="clipboard-input-error" aria-invalid="false" readOnly type="text" value={text} />
      <IconContainer copied={copied}>
        {copied ? <CheckmarkIcon size={20} /> : <CopyIcon onClick={handleCopy} size={20} />}
      </IconContainer>
    </Container>
  );
};
