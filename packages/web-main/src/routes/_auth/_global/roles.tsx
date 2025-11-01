import { Outlet, redirect, createFileRoute, useNavigate } from '@tanstack/react-router';
import { EmptyPage, Empty, Button, useLocalStorage, useTheme } from '@takaro/lib-components';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { TableListToggleButton, ViewType } from '../../../components/TableListToggleButton';
import { RolesCardView } from '../../../components/roles/RolesCardView';
import { RolesTableView } from '../../../components/roles/RolesTableView';

import { AiOutlinePlus as AddRoleIcon } from 'react-icons/ai';

export const Route = createFileRoute('/_auth/_global/roles')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_ROLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
  notFoundComponent: () => {
    return (
      <EmptyPage>
        <Empty
          header="No roles"
          description="Create a role and assign it to user or players."
          actions={[
            <Button key="create-role-button" onClick={() => redirect({ to: '/roles/create' })}>
              Create a role
            </Button>,
          ]}
        />
        <Outlet />
      </EmptyPage>
    );
  },
});

function Component() {
  useDocumentTitle('Roles');
  const { setValue: setView, storedValue: view } = useLocalStorage<ViewType>('roles-view-selector', 'list');
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: '20px',
          gap: theme.spacing[1],
        }}
      >
        <Button icon={<AddRoleIcon />} onClick={() => navigate({ to: '/roles/create' })}>
          Create new role
        </Button>
        <TableListToggleButton onChange={setView} value={view} />
      </div>
      {view === 'table' && <RolesTableView />}
      {view === 'list' && <RolesCardView />}
      <Outlet />
    </div>
  );
}
