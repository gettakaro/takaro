import { styled } from '../../../../../styled';

export const InputContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  border: 1px solid ${({ theme }): string => theme.colors.backgroundAlt};
  padding-left: ${({ theme }) => theme.spacing['0_75']};
  border-radius: ${({ theme }): string => theme.borderRadius.medium};
  cursor: text;

  .icon {
    margin: ${({ theme }) => `auto ${theme.spacing[0]}`};
  }

  &:focus-within {
    border-color: ${({ theme }): string => theme.colors.primary};
  }
`;

export const Inner = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  z-index: 2;
  max-height: unset;
  overflow-x: auto;
  height: 100%;
  width: 100%;
  scrollbar-width: none;
`;

export const Input = styled.input`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: 0;
  border: 0;
  resize: none;
  outline: none;
  overflow: auto hidden;
  min-width: 100%;
  max-height: unset;
  color: transparent;
  background-color: transparent;

  &::selection {
    background-color: transparent;
    color: transparent;
  }
`;

export const AutoCompleteContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }): string => theme.colors.secondary};
  border-radius: ${({ theme }): string => theme.borderRadius.medium};
`;

export const ListItem = styled.button<{ isActive: boolean }>`
  width: 100%;
  background-color: ${({ theme, isActive }): string => (isActive ? theme.colors.secondary : theme.colors.background)};
  color: ${({ theme }): string => theme.colors.text};
  text-align: left;
  border-radius: 0;
`;

export const TokenizerContainer = styled.div<{ isFocused: boolean }>`
  position: absolute;
  user-select: none;
  white-space: nowrap;
  word-break: break-word;
  height: 100%;
  flex: 1 1 0%;
  width: fit-content;
  padding: 0;
  top: 50%;
  cursor: pointer;
  transform: translateY(-50%);
  cursor: ${({ isFocused }) => (isFocused ? 'text' : 'normal')};
  display: flex;
  align-items: center;
  left: 5px;
`;

export const TokenKey = styled.span`
  white-space: pre;
  display: inline-block;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const TokenValue = styled(TokenKey)`
  color: ${({ theme }): string => theme.colors.primary};
`;
