import { Loading } from '.';
import { render } from 'test-utils';

it('Should render <Loading/>', () => {
  const { container } = render(<Loading />);
  expect(container).toMatchSnapshot();
});
