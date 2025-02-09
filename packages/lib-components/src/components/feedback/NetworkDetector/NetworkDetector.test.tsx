import { NetworkDetector } from '.';
import { render } from '../../../test/testUtils';
import { it, expect } from 'vitest';

it('Should render <NetworkDetector/>', () => {
  const { container } = render(<NetworkDetector />);
  expect(container).toMatchSnapshot();
});
