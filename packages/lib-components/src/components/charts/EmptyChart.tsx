import { FC } from 'react';
import { styled } from '../../styled';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  svg {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  path {
    stroke: ${({ theme }) => theme.colors.primaryShade};
    stroke-width: 1;
    fill: none;
    opacity: 0.2;
  }

  p {
    font-size: ${({ theme }) => theme.fontSize.medium};
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

export const EmptyChart: FC = () => {
  return (
    <Container>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="
      M 0,80 
      C 10,60 20,90 30,70 
      S 50,50 60,60 
      S 80,30 90,50 
      T 100,40
    "
        ></path>
      </svg>
      <p>No data available</p>
    </Container>
  );
};
