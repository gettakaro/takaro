import { Accordion } from '.';
import { render } from 'test-utils';

it('Should render <Accordion />', () => {
  const { container } = render(<Accordion title="Accordion title" />);
  expect(container).toMatchSnapshot();
});
