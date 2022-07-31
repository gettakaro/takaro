import { FC, useState, useEffect } from 'react';
import { styled } from '../../../styled';
import { AiOutlineCopy as CopyIcon, AiOutlineCheck as CheckmarkIcon } from 'react-icons/ai';
import { useSnackbar } from 'notistack';

const Container = styled.div<{ maxWidth: number | undefined; copied: boolean }>`
  position: relative;
  padding: 0;
  outline: 0;
  width: fit-content;

  input {
    width: ${({ maxWidth }): string => `${maxWidth}px`};
    padding: 8px 30px 8px 8px;
    border: 1px solid
      ${({ copied, theme }): string => (copied ? theme.colors.primary : theme.colors.gray)};
    color: ${({ theme, copied }): string => (copied ? theme.colors.primary : theme.colors.gray)};
    cursor: default;

    &:hover {
      cursor: default;
    }
  }
`;

const IconContainer = styled.div<{ copied: boolean }>`
  position: absolute;
  background-color: white;
  top: 7px;
  right: 7px;

  svg {
    fill: ${({ copied, theme }): string => (copied ? theme.colors.primary : theme.colors.gray)};
    stroke: ${({ copied, theme }): string => (copied ? theme.colors.primary : theme.colors.gray)};
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
      enqueueSnackbar('Successfully copied to clipboard', { variant: 'info' });
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  }, [copied]);

  return (
    <Container copied={copied} maxWidth={maxWidth} role="button" tabIndex={-1}>
      <input
        aria-describedby="clipboard-input-error"
        aria-invalid="false"
        readOnly
        type="text"
        value={text}
      />
      <IconContainer copied={copied}>
        {copied ? <CheckmarkIcon size={20} /> : <CopyIcon onClick={handleCopy} size={20} />}
      </IconContainer>
    </Container>
  );
};
