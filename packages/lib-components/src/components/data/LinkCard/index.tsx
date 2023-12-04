import { FC, ReactElement } from 'react';
import { styled } from '../../../styled';
import { AiOutlineLink as LinkIcon } from 'react-icons/ai';
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi';

const Container = styled.li`
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.spacing['1']};
`;

export interface LinkCardProps {
  icon?: ReactElement;
  label: string;
  href: string;
}

export const LinkCard: FC<LinkCardProps> = ({ label, href, icon }) => {
  return (
    <Container>
      {icon || <LinkIcon />}
      <span>{label}</span>
      <a href={href}>
        <ExternalLinkIcon />
      </a>
    </Container>
  );
};
