import { FC, ReactNode } from 'react';
import { styled } from '../../../styled';

export interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

const StyledExternalLink = styled.a`
  color: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const ExternalLink: FC<ExternalLinkProps> = ({ href, children, className }) => {
  return (
    <StyledExternalLink href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </StyledExternalLink>
  );
};
