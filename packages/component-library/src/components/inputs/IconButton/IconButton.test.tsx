import { IconButton } from '.';
import { render } from 'test-utils';

it('Should render <IconButton />', () => {
  const { container } = render(
    <IconButton
      icon={<div>icon</div>}
      onClick={() => {
        /* */
      }}
    />
  );
  expect(container).toMatchSnapshot();
});
