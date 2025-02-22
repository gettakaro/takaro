import { Size } from '../../../styled';
import styled from 'styled-components';

export const Container = styled.div<{ size?: Size; centered?: boolean }>`
  max-width: ${({ size }) => {
    switch (size) {
      case 'tiny':
        return '640px';
      case 'small':
        return '768px';
      case 'medium':
        return '1024px';
      case 'large':
        return '1280px';
      case 'huge':
        return '1536px';
      default:
    }
  }};
  margin: ${({ centered }) => (centered ? '0 auto' : '0')};
`;
