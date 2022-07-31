import { FC } from 'react';
import { styled } from '../../styled';
import { Button } from '../../components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  width: 100%;
  margin: 5rem 0;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 7rem 3rem;
  border-radius: 2rem;

  h2 {
    font-size: 3.5rem;
    font-weight: 800;
  }
  p {
    margin-top: 1.5rem;
    font-size: 1.5rem;
    font-weight: 500;
  }
  h2,
  p {
    text-align: center;
    color: white;
  }
  button {
    margin: 1.5rem auto 0 auto;
  }
`;

const Inner = styled.div`
  width: 40%;
  margin: 0 auto;
`;

export interface GetStartedProps {
  title?: string;
  title2?: string;
  description?: string;
  to: string;
}

export const GetStarted: FC<GetStartedProps> = ({
  title = 'Ready to dive in? ',
  title2 = 'Start using CSMM today.',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
  to
}) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Inner>
        <h2>{title}</h2>
        <h2>{title2}</h2>
        <p>{description}</p>
        <Button isWhite onClick={() => navigate(to)} size="huge" text="Get Started" />
      </Inner>
    </Container>
  );
};
