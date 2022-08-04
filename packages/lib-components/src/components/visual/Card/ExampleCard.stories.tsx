import { Meta } from '@storybook/react';
import { Card } from '.';
import { styled } from '../../../styled';
import { Button } from '../..';

const WrapperDecorator = styled.div`
  padding: 5rem;
  border-radius: 1rem;
  background-color: ${({ theme }): string => theme.colors.background};
  span {
    font-weight: 900;
  }
`;

const Container = styled.div`
  border-radius: 1rem;
  background-color: white;
  padding: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 2rem;
  button {
    margin: 0 1rem;
    &:first-child {
      margin: 0 1rem 0 0;
    }
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  h2 {
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 1rem;
  }
  p {
    font-weight: 600;
  }
`;

const ImageContainer = styled.div`
  img {
    width: 350px;
    height: auto;
  }
`;

export default {
  title: 'Layout/Card/Example',
  component: Card,
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>]
} as Meta;

export const Example = () => (
  <Container>
    <Card gradient size="large">
      <FlexContainer>
        <div>
          <h2>Drink milk, it is good for you!</h2>
          <p>
            Reduced Fat and Low Fat Milk (also know as 2% or 1% milk) have the same amount of
            calcium, protein, vitamins and minerals as whole milk, just less fat and fewer calories.
          </p>
          <ButtonContainer>
            <Button
              isWhite
              onClick={() => {
                /* */
              }}
              text="Drink Fat Milk"
            />
            <Button
              isWhite
              onClick={() => {
                /* */
              }}
              text="Drink Low Fat Milk"
              variant="outline"
            />
          </ButtonContainer>
        </div>
        <ImageContainer>
          <img alt="milk" src="images/milk.png" />
        </ImageContainer>
      </FlexContainer>
    </Card>
  </Container>
);
