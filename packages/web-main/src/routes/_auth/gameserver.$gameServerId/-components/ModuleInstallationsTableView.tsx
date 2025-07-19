import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { Table, useTableActions, styled, IconButton, Dropdown } from '@takaro/lib-components';
import { ModuleOutputDTO, ModuleInstallationOutputDTO } from '@takaro/apiclient';
import {
  AiOutlineSetting as ConfigIcon,
  AiOutlineEye as ViewConfigIcon,
  AiOutlineReload as UpdateIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineDelete as UninstallIcon,
  AiOutlineMore as ActionsIcon,
  AiOutlinePlus as InstallIcon,
  AiOutlineCheck,
  AiOutlineClose,
} from 'react-icons/ai';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { getApiClient } from '../../../../util/getApiClient';
import { useHasPermission } from '../../../../hooks/useHasPermission';
import { ModuleUninstallDialog } from '../../../../components/dialogs';
import { useSnackbar } from 'notistack';
import { moduleInstallationsOptions } from '../../../../queries/gameserver';
import { modulesQueryOptions } from '../../../../queries/module';
import { UncontrolledModuleVersionSelectQueryField } from '../../../../components/selects';
import { useQueryClient } from '@tanstack/react-query';

const ActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[0.5]};
  align-items: center;
  justify-content: flex-end;
`;

const InstallContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;
  justify-content: flex-end;
`;

type ModuleInstallationsTableViewProps = Record<string, never>;

interface CombinedModule extends ModuleOutputDTO {
  installation?: ModuleInstallationOutputDTO;
}

export const ModuleInstallationsTableView: FC<ModuleInstallationsTableViewProps> = () => {
  const navigate = useNavigate();
  const { gameServerId } = useParams({ from: '/_auth/gameserver/$gameServerId/modules' });
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openUninstallDialog, setOpenUninstallDialog] = useState<{ installation: ModuleInstallationOutputDTO } | null>(
    null,
  );
  const [selectedVersions, setSelectedVersions] = useState<{ [moduleId: string]: string }>({});
  const canManageGameServers = useHasPermission(['MANAGE_GAMESERVERS']);
  const canReadGameServers = useHasPermission(['READ_MODULES']);

  // Query for all modules
  const { data: modulesData, isPending: modulesPending } = useQuery(modulesQueryOptions());
  const modules = modulesData?.data || [];

  // Query for module installations
  const { data: installationsData, isPending: installationsPending } = useQuery(
    moduleInstallationsOptions({ filters: { gameserverId: [gameServerId] } }),
  );
  const installations = installationsData || [];

  // Combine modules with their installations
  const combinedModules: CombinedModule[] = modules.map((module) => {
    const installation = installations.find((inst) => inst.module.id === module.id);
    return { ...module, installation };
  });

  const installedModules = combinedModules.filter((mod) => mod.installation);
  const availableModules = combinedModules.filter((mod) => !mod.installation);

  const handleInstall = async (moduleId: string) => {
    const versionId = selectedVersions[moduleId];
    if (!versionId) return;

    try {
      await getApiClient().module.moduleInstallationsControllerInstallModule({
        gameServerId,
        versionId,
      });
      enqueueSnackbar('Module installed successfully', { variant: 'default', type: 'success' });
      setSelectedVersions((prev) => ({ ...prev, [moduleId]: '' }));
      queryClient.invalidateQueries();
    } catch (error: any) {
      enqueueSnackbar(`Failed to install module: ${error.message}`, { variant: 'default', type: 'error' });
    }
  };

  const handleToggleEnabled = async (installation: ModuleInstallationOutputDTO) => {
    const systemConfig = { ...installation.systemConfig } as any;
    systemConfig.enabled = !(systemConfig.enabled || false);

    try {
      await getApiClient().module.moduleInstallationsControllerInstallModule({
        gameServerId,
        versionId: installation.versionId,
        systemConfig: JSON.stringify(systemConfig),
        userConfig: JSON.stringify(installation.userConfig),
      });
      enqueueSnackbar(`Module ${systemConfig.enabled ? 'enabled' : 'disabled'} successfully`, {
        variant: 'default',
        type: 'success',
      });
      queryClient.invalidateQueries();
    } catch (error: any) {
      enqueueSnackbar(`Failed to toggle module: ${error.message}`, { variant: 'default', type: 'error' });
    }
  };

  const columnHelper = createColumnHelper<CombinedModule>();

  // Columns for installed modules table
  const installedColumns = [
    columnHelper.accessor('id', {
      header: 'ID',
      id: 'id',
      cell: (info) => info.getValue(),
      enableColumnFilter: false,
      enableHiding: true,
      meta: { hideColumn: true },
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => {
        const module = info.row.original;
        return (
          <Link to="/modules/$moduleId/view" params={{ moduleId: module.id }}>
            {info.getValue()}
          </Link>
        );
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.display({
      header: 'Version',
      id: 'version',
      cell: ({ row }) => {
        const module = row.original;
        return module.installation?.version?.tag || 'N/A';
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Status',
      id: 'status',
      cell: ({ row }) => {
        const module = row.original;
        if (!module.installation) return null;
        return (
          <IconButton
            icon={(module.installation.systemConfig as any)?.enabled ? <AiOutlineCheck /> : <AiOutlineClose />}
            onClick={() => handleToggleEnabled(module.installation!)}
            disabled={!canManageGameServers}
            ariaLabel="Toggle module"
          />
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Commands',
      id: 'commands',
      cell: ({ row }) => row.original.latestVersion?.commands?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Hooks',
      id: 'hooks',
      cell: ({ row }) => row.original.latestVersion?.hooks?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Cronjobs',
      id: 'cronjobs',
      cell: ({ row }) => row.original.latestVersion?.cronJobs?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Permissions',
      id: 'permissions',
      cell: ({ row }) =>
        row.original.latestVersion?.permissions?.filter((p: any) => !p.permission.startsWith('SYSTEM_')).length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      cell: ({ row }) => {
        const module = row.original;
        if (!module.installation) return null;

        const menuItems: any[] = [];

        if (canReadGameServers) {
          menuItems.push({
            label: 'View module configuration',
            icon: <ViewConfigIcon />,
            onClick: () => {
              navigate({
                to: '/gameserver/$gameServerId/modules/$moduleId/$moduleVersionTag/install/view',
                params: {
                  gameServerId,
                  moduleId: module.id,
                  moduleVersionTag: module.installation!.version?.tag || '',
                },
              });
            },
          });
        }

        if (canManageGameServers) {
          menuItems.push({
            label: 'Change module configuration',
            icon: <ConfigIcon />,
            onClick: () => {
              navigate({
                to: '/gameserver/$gameServerId/modules/$moduleId/$moduleVersionTag/update',
                params: {
                  gameServerId,
                  moduleId: module.id,
                  moduleVersionTag: module.installation!.version?.tag || '',
                },
              });
            },
          });

          menuItems.push({
            label: 'Install different version',
            icon: <UpdateIcon />,
            onClick: () => {
              navigate({
                to: '/gameserver/$gameServerId/modules/$moduleId/$moduleVersionTag/install',
                params: {
                  gameServerId,
                  moduleId: module.id,
                  moduleVersionTag: module.installation!.version?.tag || '',
                },
              });
            },
          });
        }

        menuItems.push({
          label: 'Copy module ID',
          icon: <CopyIcon />,
          onClick: () => {
            navigator.clipboard.writeText(module.id);
            enqueueSnackbar('Module ID copied to clipboard', { variant: 'default', type: 'success' });
          },
        });

        if (canManageGameServers) {
          menuItems.push({
            label: 'Uninstall module',
            icon: <UninstallIcon />,
            onClick: () => setOpenUninstallDialog({ installation: module.installation! }),
            color: 'error',
          });
        }

        return (
          <ActionsContainer>
            <Dropdown placement="bottom">
              <Dropdown.Trigger asChild>
                <IconButton icon={<ActionsIcon />} ariaLabel="Module actions" />
              </Dropdown.Trigger>
              <Dropdown.Menu>
                {menuItems.map((item: any, index) => (
                  <Dropdown.Menu.Item
                    key={`installed-module-action-${index}`}
                    onClick={item.onClick}
                    label={item.label}
                    icon={item.icon}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </ActionsContainer>
        );
      },
    }),
  ];

  // Columns for available modules table
  const availableColumns = [
    columnHelper.accessor('id', {
      header: 'ID',
      id: 'id',
      cell: (info) => info.getValue(),
      enableColumnFilter: false,
      enableHiding: true,
      meta: { hideColumn: true },
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => {
        const module = info.row.original;
        return (
          <Link to="/modules/$moduleId/view" params={{ moduleId: module.id }}>
            {info.getValue()}
          </Link>
        );
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('latestVersion', {
      header: 'Latest Version',
      id: 'latestVersion',
      cell: (info) => info.getValue() || 'N/A',
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Commands',
      id: 'commands',
      cell: ({ row }) => row.original.latestVersion?.commands?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Hooks',
      id: 'hooks',
      cell: ({ row }) => row.original.latestVersion?.hooks?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Cronjobs',
      id: 'cronjobs',
      cell: ({ row }) => row.original.latestVersion?.cronJobs?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Permissions',
      id: 'permissions',
      cell: ({ row }) =>
        row.original.latestVersion?.permissions?.filter((p: any) => !p.permission.startsWith('SYSTEM_')).length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      cell: ({ row }) => {
        const module = row.original;
        return (
          <InstallContainer>
            <UncontrolledModuleVersionSelectQueryField
              value={selectedVersions[module.id] || ''}
              onChange={(value) => setSelectedVersions((prev) => ({ ...prev, [module.id]: value as string }))}
              moduleId={module.id}
              name={`version-select-${module.id}`}
            />
            <IconButton
              icon={<InstallIcon />}
              ariaLabel="Install module"
              onClick={() => handleInstall(module.id)}
              disabled={!selectedVersions[module.id] || !canManageGameServers}
            />
          </InstallContainer>
        );
      },
    }),
  ];

  const installedTableActions = useTableActions<CombinedModule>({ pageSize: 25 });
  const availableTableActions = useTableActions<CombinedModule>({ pageSize: 25 });

  if (modulesPending || installationsPending) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <h3>Installed Modules</h3>
        <Table
          id="installed-modules"
          data={installedModules}
          columns={installedColumns}
          pagination={{
            paginationState: installedTableActions.pagination.paginationState,
            setPaginationState: installedTableActions.pagination.setPaginationState,
            pageOptions: installedTableActions.pagination.getPageOptions({
              data: installedModules,
              meta: { total: installedModules.length, serverTime: Date.now().toString(), error: null as any },
            }),
          }}
          columnFiltering={installedTableActions.columnFilters}
          columnSearch={installedTableActions.columnSearch}
          sorting={installedTableActions.sorting}
        />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3>Available Modules</h3>
        <Table
          id="available-modules"
          data={availableModules}
          columns={availableColumns}
          pagination={{
            paginationState: availableTableActions.pagination.paginationState,
            setPaginationState: availableTableActions.pagination.setPaginationState,
            pageOptions: availableTableActions.pagination.getPageOptions({
              data: availableModules,
              meta: { total: availableModules.length, serverTime: Date.now().toString(), error: null as any },
            }),
          }}
          columnFiltering={availableTableActions.columnFilters}
          columnSearch={availableTableActions.columnSearch}
          sorting={availableTableActions.sorting}
        />
      </div>

      {openUninstallDialog && (
        <ModuleUninstallDialog
          moduleName={openUninstallDialog.installation.module.name}
          gameServerId={gameServerId}
          versionId={openUninstallDialog.installation.versionId}
          moduleId={openUninstallDialog.installation.moduleId}
          open={true}
          onOpenChange={(open) => !open && setOpenUninstallDialog(null)}
        />
      )}
    </>
  );
};
