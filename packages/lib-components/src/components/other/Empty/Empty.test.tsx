import { Empty } from '.';
import { render } from '../../../test/testUtils.tsx';
import { expect, it } from 'vitest';

it('Should render <Empty />', () => {
  const { container } = render(
    <Empty header="this is the header" description="this is the description" actions={[]} />,
  );
  expect(container).toMatchSnapshot();
});
