import { Chip } from '.';
import { render } from 'test-utils';

it('Should render <Chip/>', () => {
  const { container } = render(<Chip label="chip label" />);
  expect(container).toMatchSnapshot();
});
