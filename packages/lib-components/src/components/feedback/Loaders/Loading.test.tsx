import { Loading } from '.';
import { render } from '../../../test/testUtils';
import { it, expect } from 'vitest';

it('Should render <Loading/>', () => {
  const { container } = render(<Loading />);
  expect(container).toMatchSnapshot();
});
