import { ClipBoard } from '.';
import { render } from '../../../test/testUtils';
import { expect, it } from 'vitest';

it('Should render <ClipBoard />', () => {
  const { container } = render(<ClipBoard text="ClipBoard text" />);
  expect(container).toMatchSnapshot();
});
