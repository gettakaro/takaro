import { FC } from 'react';
import { Color, Size, styled } from '../../../styled';

const Container = styled.div<{ size: Size; fullWidth: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : '70%')};

  ${({ size, theme }) => {
    switch (size) {
      case 'tiny':
        return `margin: ${theme.spacing['0_25']} auto ${theme.spacing['0_25']} auto`;
      case 'small':
        return `margin: ${theme.spacing['0_5']} auto ${theme.spacing['0_5']} auto`;
      case 'medium':
        return `margin: ${theme.spacing['0_75']} auto ${theme.spacing['0_75']} auto`;
      case 'large':
        return `margin: ${theme.spacing['2_5']} auto ${theme.spacing['2_5']} auto`;
      case 'huge':
        return `margin: ${theme.spacing[6]} auto ${theme.spacing[6]} auto`;
    }
  }}
`;

const Label = styled.label<{
  position: 'left' | 'center' | 'right';
  color: Color | 'text' | 'textAlt';
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  p {
    color: ${({ theme, color }) => theme.colors[color]};
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    font-size: 1.325rem;
    font-weight: 500;
    padding: ${({ theme }) => `0 ${theme.spacing['0_5']}`};
  }

  ${({ position }) => {
    switch (position) {
      case 'left':
        return `
          left: 0;
        `;
      case 'center':
        return `
        left: 50%;
        `;
      case 'right':
        return `
        right: 0
        `;
    }
  }}
`;
const Line = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.backgroundAccent};
`;

type LabelProps = {
  text: string;
  labelPosition: 'left' | 'center' | 'right';
  color?: Color | 'text' | 'textAlt';
};

export interface DividerProps {
  label?: LabelProps;
  size?: Size;
  fullWidth?: boolean;
  /* TODO: reimplement sizing (this might go automatically with different density options. */
}

export const Divider: FC<DividerProps> = ({ label, size = 'medium', fullWidth = false }) => {
  return (
    <Container fullWidth={fullWidth} size={size}>
      <Line />
      {label && (
        <Label position={label.labelPosition} color={label.color ? label.color : 'textAlt'}>
          <p>{label.text}</p>
        </Label>
      )}
    </Container>
  );
};
