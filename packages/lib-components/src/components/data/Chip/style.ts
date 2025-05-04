import { styled } from '../../../styled';
import { ChipColor, ShowIcon } from '.';
import { shade } from 'polished';

export const Container = styled.div<{
  disabled: boolean;
  color: ChipColor;
  clickable: boolean;
  showIcon: ShowIcon;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing['0_25']} ${theme.spacing['0_5']}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: ${({ clickable }): string => (clickable ? 'pointer' : 'auto')};
  width: fit-content;
  height: 20px;
  background-color: ${({ theme, color }) => shade(0.5, theme.colors[color])};
  border: 0.1rem solid ${({ theme, color }) => theme.colors[color]};

  svg {
    margin-left: ${({ theme }) => theme.spacing['0_5']};
    cursor: pointer;
    transition: width 0.2s ease-in-out;
    will-change: width;
    display: ${({ showIcon }): string => (showIcon === 'always' ? 'inline-block' : 'none')};
    ${({ theme, color }) => {
      return `fill: ${theme.colors[color]};`;
    }}
  }

  &:hover {
    svg {
      display: inline-block;
    }
  }

  span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    font-size: ${({ theme }) => theme.fontSize.medium};
    user-select: none;
    color: white;
  }
`;
