import { Alert } from '.';
import { render } from 'test-utils';

it('Should render <Alert/>', () => {
  const { container } = render(<Alert text="Alert text" title="Alert title" variant="info" />);
  expect(container).toMatchSnapshot();
});
