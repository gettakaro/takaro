import { Skeleton } from '.';
import { render } from 'test-utils';

it('Should render <Skeleton/>', () => {
  const { container } = render(<Skeleton variant="rectangular" />);
  expect(container).toMatchSnapshot();
});
