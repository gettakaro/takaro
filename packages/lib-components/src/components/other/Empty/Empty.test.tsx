import { Empty } from '.';
import { render } from 'test-utils';

it('Should render <Empty />', () => {
  const { container } = render(<Empty />);
  expect(container).toMatchSnapshot();
});
