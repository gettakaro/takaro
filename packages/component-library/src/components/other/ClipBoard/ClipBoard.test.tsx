import { ClipBoard } from '.';
import { render } from 'test-utils';

it('Should render <ClipBoard />', () => {
  const { container } = render(<ClipBoard text="ClipBoard text" />);
  expect(container).toMatchSnapshot();
});
