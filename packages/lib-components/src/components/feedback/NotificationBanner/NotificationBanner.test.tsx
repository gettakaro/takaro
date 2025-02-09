import { NotificationBanner } from '.';
import { it, expect } from 'vitest';
import { render } from '../../../test/testUtils';

it('Should render <NotificationBanner/>', () => {
  // we need to create the portal
  const notificationBannerPortal = document.createElement('div');
  notificationBannerPortal.setAttribute('id', 'notification-banner');
  document.body.appendChild(notificationBannerPortal);

  const { container } = render(
    <NotificationBanner description="Notification banner description" title="Notification banner title" />,
  );
  expect(container).toMatchSnapshot();
});
