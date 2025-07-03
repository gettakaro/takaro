import { FC, useEffect, useState } from 'react';
import { Chip } from '../../../components';
import { AiOutlineLink as LinkIcon, AiFillCopy as CopyIcon, AiOutlineCheck as CheckmarkIcon } from 'react-icons/ai';
import { ExternalLink } from '../../actions/ExternalLink';
import { styled } from '../../../styled';

export interface SteamIdLinkProps {
  steamId?: string;
  placeholder?: string;
}

const IconContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StyledCopyIcon = styled(CopyIcon)`
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
`;

const StyledCheckmarkIcon = styled(CheckmarkIcon)`
  color: ${({ theme }) => theme.colors.success};
`;

export const SteamIdLink: FC<SteamIdLinkProps> = ({ steamId, placeholder }) => {
  const [copied, setCopied] = useState<boolean>(false);

  function handleCopy(text: string) {
    setCopied(true);
    navigator.clipboard.writeText(text);
  }

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  }, [copied]);

  if (!steamId) {
    return placeholder ? <span>{placeholder}</span> : <span>Unknown</span>;
  }

  const steamUrl = `https://steamcommunity.com/profiles/${steamId}`;

  return (
    <Chip
      icon={
        <IconContainer>
          <ExternalLink href={steamUrl}>
            <LinkIcon />
          </ExternalLink>
          {copied ? <StyledCheckmarkIcon /> : <StyledCopyIcon onClick={() => handleCopy(steamId)} />}
        </IconContainer>
      }
      variant="outline"
      label={placeholder || steamId}
      color="backgroundAccent"
    />
  );
};
