import { FC, ReactElement, useEffect, useState } from 'react';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  z-index: 50;
  padding-top: 4rem;
`;

const FooterContainer = styled.div``;



export interface CommandPaletteProps {
  footer?: ReactElement;
}

export const CommandPalette: FC<CommandPaletteProps> = ({ footer }) => {

  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    /**/
  }, []);

  return (
    <Wrapper>
      <input />
      {footer && <FooterContainer>{footer}</FooterContainer>}
    </Wrapper>
  );
};
