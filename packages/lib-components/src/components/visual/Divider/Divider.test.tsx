import { Divider } from '.';
import { render } from 'test-utils';

it('Should render <Accordion />', () => {
  const { container } = render(<Divider />);
  expect(container).toMatchSnapshot();
});
