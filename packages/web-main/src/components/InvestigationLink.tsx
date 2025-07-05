import { FC, ReactNode } from 'react';
import { styled, Tooltip, IconButton } from '@takaro/lib-components';
import { AiOutlineLink as LinkIcon } from 'react-icons/ai';

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

const StyledIconButton = styled(IconButton)`
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

export interface InvestigationLinkProps {
  href: string;
  tooltipText: string;
  children: ReactNode;
  showIcon?: boolean;
  iconOnly?: boolean;
}

export const InvestigationLink: FC<InvestigationLinkProps> = ({
  href,
  tooltipText,
  children,
  showIcon = true,
  iconOnly = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  if (iconOnly && showIcon) {
    return (
      <Tooltip>
        <Tooltip.Trigger asChild>
          <StyledIconButton
            icon={<LinkIcon />}
            onClick={handleClick}
            size="tiny"
            color="primary"
            ariaLabel={tooltipText}
          />
        </Tooltip.Trigger>
        <Tooltip.Content>{tooltipText}</Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <Container>
      {children}
      {showIcon && (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <StyledIconButton
              icon={<LinkIcon />}
              onClick={handleClick}
              size="tiny"
              color="primary"
              ariaLabel={tooltipText}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>{tooltipText}</Tooltip.Content>
        </Tooltip>
      )}
    </Container>
  );
};
