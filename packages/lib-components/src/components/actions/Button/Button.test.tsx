import { Button } from '.';
import { expect, it } from 'vitest';
import { render } from '../../../test/testUtils';

it('Should render <Button/>', () => {
  const { container } = render(<Button>button text</Button>);
  expect(container).toMatchSnapshot();
});
