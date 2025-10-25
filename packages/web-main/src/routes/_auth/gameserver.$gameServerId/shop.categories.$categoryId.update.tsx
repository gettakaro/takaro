import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { CategoryForm, FormFields } from '../../../components/shop/CategoryForm';
import { shopCategoryQueryOptions, useShopCategoryUpdate } from '../../../queries/shopCategories';
import { DrawerSkeleton } from '@takaro/lib-components';
import { SubmitHandler } from 'react-hook-form';

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
  loader: ({ params, context }) => context.queryClient.ensureQueryData(shopCategoryQueryOptions(params.categoryId)),
  pendingComponent: DrawerSkeleton,
  component: Component,
});

function Component() {
  const { categoryId, gameServerId } = Route.useParams();

  const category = Route.useLoaderData();
  const { mutate: updateCategory, isSuccess, isPending } = useShopCategoryUpdate();
  const navigate = Route.useNavigate();

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    updateCategory({
      shopCategoryId: categoryId,
      shopCategoryDetails: {
        name: data.name,
        emoji: data.emoji,
        parentId: data.parentId ?? undefined,
      },
    });
  };

  if (isSuccess) {
    navigate({
      to: '/gameserver/$gameServerId/shop/categories',
      params: { gameServerId },
    });
  }

  return <CategoryForm gameServerId={gameServerId} initialData={category} onSubmit={onSubmit} isPending={isPending} />;
}
