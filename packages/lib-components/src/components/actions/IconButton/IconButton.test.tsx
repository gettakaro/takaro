import { IconButton } from '.';
import { render } from '../../../test/testUtils';
import { it, expect } from 'vitest';

it('Should render <IconButton />', () => {
  const { container } = render(<IconButton icon={<div>icon</div>} ariaLabel="test" />);
  expect(container).toMatchSnapshot();
});
