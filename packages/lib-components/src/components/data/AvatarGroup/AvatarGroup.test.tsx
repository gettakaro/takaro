import { AvatarGroup } from '.';
import { Avatar } from '../Avatar';
import { render } from 'test-utils';

it('Should render <AvatarGroup/>', () => {
  const { container } = render(
    <AvatarGroup>
      <Avatar alt="Avatar 1" />
      <Avatar alt="Avatar 2" />
    </AvatarGroup>
  );
  expect(container).toMatchSnapshot();
});
