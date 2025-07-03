import { Divider } from '.';
import { render } from '../../../test/testUtils';
import { it, expect } from 'vitest';

it('Should render <Accordion />', () => {
  const { container } = render(<Divider />);
  expect(container).toMatchSnapshot();
});
