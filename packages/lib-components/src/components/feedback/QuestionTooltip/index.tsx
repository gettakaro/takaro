import { FC } from 'react';
import { Tooltip, TooltipProps } from '../Tooltip';
import { AiOutlineQuestion as QuestionIcon } from 'react-icons/ai';
import { styled } from '../../../styled';

const TriggerContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing['0_5']};
  margin-right: ${({ theme }) => theme.spacing['0_5']};
`;

const ContentContainer = styled.div`
  max-width: 450px;
  hyphens: auto;
`;

export const QuestionTooltip: FC<TooltipProps> = ({ children }) => {
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <TriggerContainer>
          <QuestionIcon size="18" />
        </TriggerContainer>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <ContentContainer>{children}</ContentContainer>
      </Tooltip.Content>
    </Tooltip>
  );
};
