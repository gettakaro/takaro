import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { CategoryForm } from '../../../components/shop/CategoryForm';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/categories/$categoryId/update')({
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
  component: () => {
    const { categoryId } = Route.useParams();
    return <CategoryForm categoryId={categoryId} />;
  },
});
