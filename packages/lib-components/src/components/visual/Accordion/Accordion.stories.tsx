import { Meta, Story } from '@storybook/react';
import { styled } from '../../../styled';
import { Accordion, AccordionProps } from '.';
import { Button } from '../../../components';

export default {
  title: 'Layout/Accordion',
  component: Accordion
} as Meta;

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  width: 500px;
  flex-direction: column;
  padding: 2rem 3rem;
  box-shadow: ${({ theme }): string => theme.shadows.default};
`;

const Intro = styled.div`
  padding: 2rem;
  border-bottom: 2px solid ${({ theme }): string => theme.colors.placeholder};
  h5 {
    font-size: 2rem;
  }
`;

const AccordionContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  p {
    color: black;
    font-size: 1.225rem;
    margin-bottom: 1.2rem;
  }
`;

export const Default: Story<AccordionProps> = () => (
  <Wrapper>
    <Container>
      <Intro>
        <h5>Several windows stacked on each other</h5>
        <p>
          The accordion is a graphical control element comprising a vertically stacked list of
          items, such as labels or thumbnails.
        </p>
      </Intro>
      <Accordion color="tertiary" title="Why this term?">
        <AccordionContent>
          <p>CSMM makes use of a webapi.</p>
        </AccordionContent>
      </Accordion>
      <Accordion color="tertiary" title="When to use accordion components">
        <AccordionContent>
          <p>
            CSMM costs you nothing! While donators have access to extended features, free users can
            expect a fully featured server manager.
          </p>
        </AccordionContent>
      </Accordion>
      <Accordion color="tertiary" defaultVisible title="How can it be defined?">
        <AccordionContent>
          <p>
            Several windows are stacked on each other. All of them are "shaded". So only their
            captions are visible. if one of them is clicked, to make it active, it is "unshaded" or
            "maximized". Other windows in accordion are displaced around top or bottom edges.
          </p>
          <Button
            color="tertiary"
            onClick={() => {
              /* */
            }}
            size="tiny"
            text="Read more"
          />
        </AccordionContent>
      </Accordion>
      <Accordion color="tertiary" title="When to use accordion components">
        <AccordionContent>
          <p>
            CSMM costs you nothing! While donators have access to extended features, free users can
            expect a fully featured server manager.
          </p>
        </AccordionContent>
      </Accordion>
    </Container>
  </Wrapper>
);
