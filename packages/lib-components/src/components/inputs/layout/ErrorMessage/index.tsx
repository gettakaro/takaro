import { FC, useEffect, useRef, useState } from 'react';
import { styled } from '../../../../styled';
import { motion } from 'framer-motion';
import { shade } from 'polished';

const Container = styled(motion.div)<{ $isWrapped: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  bottom: ${({ theme }) => `-${theme.spacing['5']}`};
  left: 0;
  width: 100%;
  height: auto;
  background-color: ${({ theme }): string => shade(0.5, theme.colors.error)};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  z-index: ${({ theme }) => theme.zIndex.errorMessage};
  top: 100%;
  bottom: auto;
  padding: ${({ theme, $isWrapped }) =>
    $isWrapped
      ? `${theme.spacing['0_5']} ${theme.spacing['1_5']} ${theme.spacing['0_5']} ${theme.spacing['1_5']}`
      : `${theme.spacing['0_25']} ${theme.spacing['1_5']} ${theme.spacing['0_5']} ${theme.spacing['1_5']}`};
`;

const Content = styled.span`
  display: flex;
  align-items: center;
  min-width: 100%;
  width: 100%;
  color: white;
  font-weight: 500;
  line-height: 1.2;
  min-height: ${({ theme }) => theme.spacing['2_5']};
  white-space: normal;
  hyphens: auto;
`;

export interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ message }) => {
  const [isWrapped, setIsWrapped] = useState<boolean>(false);
  const contentRef = useRef<HTMLSpanElement>(null);

  // useEffect required since we depend on the DOM
  useEffect(() => {
    if (contentRef.current) {
      setIsWrapped(contentRef.current.offsetWidth < contentRef.current.scrollWidth);
    }
  }, [message]);

  return (
    <Container initial={{ y: -10 }} animate={{ y: 0 }} $isWrapped={isWrapped}>
      <Content ref={contentRef}>
        {message}
        {isWrapped}
      </Content>
    </Container>
  );
};
