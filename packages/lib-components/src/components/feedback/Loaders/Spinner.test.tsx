import { Spinner } from '.';
import { render } from 'test-utils';

it('Should render <Spinner/>', () => {
  const { container } = render(<Spinner size="small" />);
  expect(container).toMatchSnapshot();
});
