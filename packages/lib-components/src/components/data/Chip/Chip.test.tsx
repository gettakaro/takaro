import { Chip } from '.';
import { render } from '../../../test/testUtils';
import { expect, it } from 'vitest';

it('Should render <Chip/>', () => {
  const { container } = render(<Chip variant="outline" label="chip label" />);
  expect(container).toMatchSnapshot();
});
