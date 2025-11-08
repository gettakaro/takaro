import { cloneElement, FC, ReactElement } from 'react';
import { Tooltip, TooltipProps } from '../Tooltip';
import { Size, styled } from '../../../styled';
import { getIconSize } from '../../actions/IconButton/getIconSize';
import { ButtonColor } from '../../actions/Button/style';

type TooltipIconColor = Exclude<ButtonColor, 'white'>;

const TriggerContainer = styled.div<{ color: TooltipIconColor }>`
  border: 1px solid ${({ theme, color }) => theme.colors[color]};
  border-radius: ${({ theme }) => theme.borderRadius.small};
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

export interface IconTooltipProps extends TooltipProps {
  icon: ReactElement;
  size?: Size;
  color?: TooltipIconColor;
}

export const IconTooltip: FC<IconTooltipProps> = ({
  children,
  initialOpen,
  open,
  icon,
  size = 'medium',
  color = 'primary',
}) => {
  return (
    <Tooltip initialOpen={initialOpen} open={open}>
      <Tooltip.Trigger asChild>
        <TriggerContainer color={color}>{cloneElement(icon, { size: getIconSize(size) })}</TriggerContainer>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <ContentContainer>{children}</ContentContainer>
      </Tooltip.Content>
    </Tooltip>
  );
};
