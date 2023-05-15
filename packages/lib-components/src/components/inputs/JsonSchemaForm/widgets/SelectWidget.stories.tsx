import React from 'react';
import { styled } from '../../../../styled';

const Wrapper = styled.div`
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};

  & > div {
    margin: 0 auto;
    padding: 0.2rem 1rem;
  }

  form {
    width: 100%;
  }
`;

export default {
  title: 'Schema/Widgets/Select',
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
};

export const Default = () => {
  return <div></div>;
};
