import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { CategoryManagement } from '../../../components/shop/CategoryManagement';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/categories')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }

    const hasManagePermission = hasPermission(session, ['MANAGE_SHOP_LISTINGS']);
    if (!hasManagePermission) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: () => (
    <>
      <CategoryManagement />
      <Outlet />
    </>
  ),
});
