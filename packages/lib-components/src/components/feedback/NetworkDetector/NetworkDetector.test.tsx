import { NetworkDetector } from '.';
import { render } from 'test-utils';

it('Should render <NetworkDetector/>', () => {
  const { container } = render(<NetworkDetector />);
  expect(container).toMatchSnapshot();
});
