import { FC } from 'react';
import { Size, styled } from '../../../styled';

const Container = styled.div<{ spacing: Size }>`
  position: relative;
  display: flex;
  align-items: center;
  width: 70%;

  ${({ spacing }) => {
    switch (spacing) {
      case 'tiny':
        return 'margin: .25rem auto .25rem auto';
      case 'small':
        return 'margin: .5rem auto .5rem auto';
      case 'medium':
        return 'margin: 1rem auto 1rem auto';
      case 'large':
        return 'margin: 2.225rem auto 2.225rem auto';
      case 'huge':
        return 'margin: 6rem auto 6rem auto';
    }
  }}
`;
const Label = styled.label<{ position: 'left' | 'center' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  p {
    z-index: 20;
    color: gray;
    background-color: white;
    font-size: 1.325rem;
    padding: 0 0.5rem;
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
  background-color: ${({ theme }) => theme.colors.gray};
  z-index: 0;
`;

type LabelProps = {
  text: string;
  labelPosition: 'left' | 'center' | 'right';
};

export interface DividerProps {
  label?: LabelProps;
  spacing?: Size;
}

export const Divider: FC<DividerProps> = ({ label, spacing = 'medium' }) => {
  return (
    <Container spacing={spacing}>
      <Line />
      {label && (
        <Label position={label.labelPosition}>
          <p>{label.text}</p>
        </Label>
      )}
    </Container>
  );
};
