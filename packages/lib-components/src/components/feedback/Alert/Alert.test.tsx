import { Alert } from '.';
import { render } from '../../../test/testUtils';
import { expect, it } from 'vitest';

it('Should render <Alert/>', () => {
  const { container } = render(<Alert text="Alert text" title="Alert title" variant="info" />);
  expect(container).toMatchSnapshot();
});
