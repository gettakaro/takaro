import { Button } from '.';
import { render } from 'test-utils';

it('Should render <Button/>', () => {
  const { container } = render(<Button text="button text" />);
  expect(container).toMatchSnapshot();
});
