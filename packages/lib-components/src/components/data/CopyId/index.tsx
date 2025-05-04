import { FC, useEffect, useState } from 'react';
import { Chip, Tooltip } from '../../../components';
import { AiFillCopy as CopyIcon, AiOutlineCheck as CheckmarkIcon, AiOutlineLink as LinkIcon } from 'react-icons/ai';
import { styled } from '../../../styled';

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

const LinkButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing['0_5']};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};

    svg {
      color: ${({ theme }) => theme.colors.white};
    }
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface CopyIdProps {
  id?: string;
  placeholder?: string;
  copyText?: string;
  externalLink?: string;
  externalLinkTooltip?: string;
}

export const CopyId: FC<CopyIdProps> = ({
  id,
  placeholder,
  copyText = 'copied',
  externalLink,
  externalLinkTooltip = 'Open external link',
}) => {
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

  if (externalLink) {
    return (
      <Container>
        <Chip
          icon={copied ? <CheckmarkIcon /> : <CopyIcon />}
          onClick={() => handleCopy(id)}
          label={copied ? copyText : placeholder ? placeholder : id}
          color="backgroundAccent"
        />
        <Tooltip>
          <Tooltip.Trigger asChild>
            <LinkButton
              onClick={(e) => {
                e.stopPropagation();
                window.open(externalLink, '_blank', 'noopener,noreferrer');
              }}
              aria-label={externalLinkTooltip}
            >
              <LinkIcon />
            </LinkButton>
          </Tooltip.Trigger>
          <Tooltip.Content>{externalLinkTooltip}</Tooltip.Content>
        </Tooltip>
      </Container>
    );
  }

  return (
    <Chip
      icon={copied ? <CheckmarkIcon /> : <CopyIcon />}
      onClick={() => handleCopy(id)}
      label={copied ? copyText : placeholder ? placeholder : id}
      color="backgroundAccent"
    />
  );
};
