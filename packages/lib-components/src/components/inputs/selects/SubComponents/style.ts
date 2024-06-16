import { styled } from '../../../../styled';

export const OptionContainer = styled.li<{
  isActive: boolean;
  isMultiSelect: boolean;
  isGrouped: boolean;
  disabled: boolean;
}>`
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1']}`};
  min-height: ${({ theme }) => theme.spacing[4]};
  cursor: default;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAlt};
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: ${({ isMultiSelect }) => (isMultiSelect ? 'flex-start' : 'space-between')};
  transition: transform 0.15s ease-out;
  outline: 0;
  scroll-margin: ${({ theme }) => theme.spacing['0_75']};
  padding-left: ${({ isGrouped, theme }) => (isGrouped ? `calc(1.7 * ${theme.spacing['2']})` : theme.spacing['1'])}};


  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:hover {
    border-color: ${({ theme, disabled }) => (disabled ? theme.colors.backgroundAlt : theme.colors.backgroundAccent)};
    span {
      color: white;
    }
  }

  & > div {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};

    span {
      cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
      color: ${({ theme, isActive, disabled }) => {
        if (disabled) {
          return theme.colors.backgroundAccent;
        }
        if (isActive) {
          return theme.colors.white;
        }
        return theme.colors.text;
      }};
    }
  }
`;
