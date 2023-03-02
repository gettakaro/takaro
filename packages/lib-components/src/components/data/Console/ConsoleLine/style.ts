import { styled } from '../../../../styled';
import { MessageType } from '../ConsoleInterface';
import { tint } from 'polished';
import { BsChevronExpand as EnterIcon } from 'react-icons/bs';

export const Wrapper = styled.div<{
  canCollapse: boolean;
  messageType: MessageType;
}>`
  display: flex;
  flex-direction: row;
  font-family: 'inconsolata';
  font-size: 1.3rem;
  pointer: ${({ canCollapse }) => (canCollapse ? 'pointer' : 'default')};
  user-select: auto;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[0]}`};
  border-top: 1px solid
    ${({ messageType, theme }): string => {
      if (messageType === 'error') return tint(0.4, theme.colors.error);
      if (messageType === 'warning') return tint(0.4, theme.colors.warning);
      if (messageType === 'command') return tint(0.4, theme.colors.primary);
      return 'none';
    }};
  border-bottom: 1px solid
    ${({ messageType, theme }): string => {
      if (messageType === 'error') return tint(0.4, theme.colors.error);
      if (messageType === 'warning') return tint(0.4, theme.colors.warning);
      if (messageType === 'command') return tint(0.4, theme.colors.primary);
      return 'none';
    }};

  background-color: ${({ messageType, theme }): string => {
    if (messageType === 'error') return tint(0.6, theme.colors.error);
    if (messageType === 'warning') return tint(0.6, theme.colors.warning);
    if (messageType === 'command') return tint(0.6, theme.colors.primary);
    return 'none';
  }};

  &:last-child {
    border-bottom: none;
  }
`;

export const Container = styled.div<{ isCollapsed: boolean }>`
  max-width: 100%;
  vertical-align: top;
  display: grid;
  grid-template-columns: 4rem 20rem auto;
  text-align: left;
  margin: ${({ theme }) => theme.spacing[0]};
`;

export const IconContainer = styled.div<{ messageType: MessageType }>`
  margin-left: ${({ theme }) => theme.spacing['0_75']};
  svg {
    fill: ${({ theme, messageType }) => {
      if (messageType === 'debug') return theme.colors.error;
      if (messageType === 'command') return theme.colors.primary;
      return theme.colors[messageType];
    }};
  }
`;

export const TimestampContainer = styled.div`
  font-family: 'inconsolata';
  font-size: 1.3rem;
  margin-right: ${({ theme }) => theme.spacing['0_5']};
`;

export const TextContainer = styled.div`
  font-family: 'inconsolata';
  font-size: 1.4rem;
`;

export const CollapsedContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div<{ isCollapsed: boolean; type: MessageType }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  p {
    font-family: 'inconsolata';
    font-size: 1.4rem;
    user-select: auto;
  }
`;

export const Body = styled.div<{ isCollapsed: boolean; type: MessageType }>`
  display: ${({ isCollapsed }) => (isCollapsed ? 'none' : 'block')};
  font-family: 'inconsolata';
  font-size: 1.4rem;
`;

export const StyledExpandIcon = styled(EnterIcon)`
  position: absolute;
  cursor: pointer;
  right: 2rem;
`;
