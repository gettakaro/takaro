import { styled } from '../../../../styled';
import { MessageType } from '../MessageModel';
import { BsChevronExpand as EnterIcon } from 'react-icons/bs';

export const Wrapper = styled.div<{
  messageType: MessageType;
}>`
  display: flex;
  flex-direction: row;
  position: relative;
  font-family: 'inconsolata';
  width: 100%;
  background-color: ${({ theme }): string => theme.colors.backgroundAlt};

  &:last-child {
    border-bottom: none;
  }
`;

export const Container = styled.div<{ isCollapsed: boolean }>`
  max-width: 100%;
  width: 100%;
  height: fit-content;

  display: grid;
  align-content: start;
  grid-template-columns: 4rem 20rem 1fr;

  margin: ${({ theme }) => theme.spacing[0]};
`;

export const IconContainer = styled.div<{ messageType: MessageType }>`
  padding-left: ${({ theme }) => theme.spacing['0_75']};
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
  margin-right: ${({ theme }) => theme.spacing['0_5']};
`;

export const TextContainer = styled.div`
  font-family: 'inconsolata';
  font-size: ${({ theme }) => theme.fontSize.medium};
  color: ${({ theme }) => theme.colors.text};
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
  }
`;

export const Body = styled.pre<{ isCollapsed: boolean; type: MessageType }>`
  display: ${({ isCollapsed }) => (isCollapsed ? 'none' : 'block')};
  font-family: 'inconsolata';
`;

export const StyledExpandIcon = styled(EnterIcon)`
  position: absolute;
  cursor: pointer;
  right: ${({ theme }) => theme.spacing['2']};
`;
