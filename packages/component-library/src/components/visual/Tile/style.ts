import { styled, Color, AlertVariants, shakeAnimation } from '../../../styled';

export const Container = styled.div<{
  bgColor: Color | AlertVariants | 'white';
  clickable: boolean;
  $loading: boolean;
}>`
  width: 300px;
  height: 285px;
  border-radius: 15px;
  box-shadow: 1px 14px 15px -12px #00000023;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 25px 50px;
  background-color: ${({ bgColor, $loading, theme }) =>
    $loading ? '#fff' : theme.colors[bgColor]};
  cursor: ${({ clickable }): string => (clickable ? 'pointer' : 'default')};
  animation: ${({ clickable }) => (clickable ? shakeAnimation : null)} 4s
    cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite both;
  transform: translate3d(0, 0, 0);
  position: relative;
`;

export const ContentContainer = styled.div<{
  textColor: Color | AlertVariants | 'white';
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  h4 {
    font-weight: 700;
    font-size: 1.225rem;
  }
  p {
    font-weight: 800;
    font-size: 3.225rem;
  }

  h4,
  p {
    color: ${({ textColor, theme }) => theme.colors[textColor]};
  }
`;
