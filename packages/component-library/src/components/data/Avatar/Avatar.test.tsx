import { Avatar } from '.';
import { render } from 'test-utils';

it('Should render <Avatar/>', () => {
  const { container } = render(<Avatar alt="Avatar" />);
  expect(container).toMatchSnapshot();
});
