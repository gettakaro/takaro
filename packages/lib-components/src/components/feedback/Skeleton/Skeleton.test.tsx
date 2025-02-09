import { Skeleton } from '.';
import { it, expect } from 'vitest';
import { render } from '../../../test/testUtils';

it('Should render <Skeleton/>', () => {
  const { container } = render(<Skeleton variant="rectangular" />);
  expect(container).toMatchSnapshot();
});
