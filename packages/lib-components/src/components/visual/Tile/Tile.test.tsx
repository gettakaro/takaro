import { Tile } from '.';
import { render } from 'test-utils';

it('Should render <Tile />', () => {
  const { container } = render(<Tile bgColor="warning" textColor="primary" />);
  expect(container).toMatchSnapshot();
});
