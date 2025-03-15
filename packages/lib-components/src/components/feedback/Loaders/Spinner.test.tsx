import { Spinner } from '.';
import { render } from '../../../test/testUtils';
import { it, expect } from 'vitest';

it('Should render <Spinner/>', () => {
  const { container } = render(<Spinner size="small" />);
  expect(container).toMatchSnapshot();
});
