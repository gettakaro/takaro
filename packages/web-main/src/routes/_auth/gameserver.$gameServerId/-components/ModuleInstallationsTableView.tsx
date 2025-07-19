import { FC, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, Table as TableInstance } from '@tanstack/react-table';
import { Table, useTableActions, styled, IconButton, Switch, Dropdown } from '@takaro/lib-components';
import { ModuleOutputDTO, ModuleInstallationOutputDTO } from '@takaro/apiclient';
import { RiSettingsLine as ConfigIcon } from '@takaro/icons';
import { RiEyeLine as ViewConfigIcon } from '@takaro/icons';
import { RiRefreshLine as UpdateIcon } from '@takaro/icons';
import { RiFileCopyLine as CopyIcon } from '@takaro/icons';
import { RiDeleteBinLine as UninstallIcon } from '@takaro/icons';
import { RiMore2Line as ActionsIcon } from '@takaro/icons';
import { RiAddLine as InstallIcon } from '@takaro/icons';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { getApiClient } from '../../../../util/getApiClient';
import { hasPermission } from '../../../../hooks/useHasPermission';
import { ModuleUninstallDialog } from '../../../../components/dialogs';
import { useSnackbar } from 'notistack';
import { modulesQueryOptions, moduleInstallationsOptions } from '../../../../queries/gameserver';
import { ModuleVersionSelectQueryField } from '../../../../components/selects';
import { mutationWrapper } from '../../../../queries/util';

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
  const { showSuccess, showError } = useSnackbar();
  const [openUninstallDialog, setOpenUninstallDialog] = useState<{ installation: ModuleInstallationOutputDTO } | null>(
    null,
  );
  const [selectedVersions, setSelectedVersions] = useState<{ [moduleId: string]: string }>({});
  const installedTableRef = useRef<TableInstance<CombinedModule>>(null);
  const availableTableRef = useRef<TableInstance<CombinedModule>>(null);

  // Query for all modules
  const { data: modulesData, isPending: modulesPending } = useQuery(modulesQueryOptions());
  const modules = modulesData?.data || [];

  // Query for module installations
  const { data: installationsData, isPending: installationsPending } = useQuery(
    moduleInstallationsOptions({ filters: { gameserverId: [gameServerId] } }),
  );
  const installations = installationsData?.data || [];

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

    await mutationWrapper({
      fn: async () => {
        await getApiClient().module.moduleControllerInstallModule(gameServerId, moduleId, versionId);
      },
      onSuccess: () => {
        showSuccess('Module installed successfully');
        setSelectedVersions((prev) => ({ ...prev, [moduleId]: '' }));
      },
      onError: (error) => {
        showError(`Failed to install module: ${error.message}`);
      },
    });
  };

  const handleToggleEnabled = async (installation: ModuleInstallationOutputDTO) => {
    const newUserConfig = {
      ...installation.userConfig,
      enabled: !installation.userConfig.enabled,
    };

    await mutationWrapper({
      fn: async () => {
        await getApiClient().gameserver.gameServerControllerInstallModule(gameServerId, installation.moduleId, {
          versionId: installation.versionId,
          userConfig: newUserConfig,
        });
      },
      onSuccess: () => {
        showSuccess(`Module ${newUserConfig.enabled ? 'enabled' : 'disabled'} successfully`);
      },
      onError: (error) => {
        showError(`Failed to toggle module: ${error.message}`);
      },
    });
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
      meta: { isHidden: true },
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
          <Switch
            checked={module.installation.userConfig.enabled}
            onChange={() => handleToggleEnabled(module.installation!)}
            disabled={!hasPermission(['MANAGE_GAMESERVERS'])}
          />
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Commands',
      id: 'commands',
      cell: ({ row }) => (row.original as any).commands?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Hooks',
      id: 'hooks',
      cell: ({ row }) => (row.original as any).hooks?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Cronjobs',
      id: 'cronjobs',
      cell: ({ row }) => (row.original as any).cronJobs?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Permissions',
      id: 'permissions',
      cell: ({ row }) =>
        (row.original as any).permissions?.filter((p: any) => !p.permission.startsWith('SYSTEM_')).length || 0,
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

        if (hasPermission(['READ_GAMESERVERS'])) {
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

        if (hasPermission(['MANAGE_GAMESERVERS'])) {
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
            showSuccess('Module ID copied to clipboard');
          },
        });

        if (hasPermission(['MANAGE_GAMESERVERS'])) {
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
                    color={item.color}
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
      meta: { isHidden: true },
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
      cell: ({ row }) => (row.original as any).commands?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Hooks',
      id: 'hooks',
      cell: ({ row }) => (row.original as any).hooks?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Cronjobs',
      id: 'cronjobs',
      cell: ({ row }) => (row.original as any).cronJobs?.length || 0,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Permissions',
      id: 'permissions',
      cell: ({ row }) =>
        (row.original as any).permissions?.filter((p: any) => !p.permission.startsWith('SYSTEM_')).length || 0,
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
            <ModuleVersionSelectQueryField
              control={{
                field: {
                  value: selectedVersions[module.id] || '',
                  onChange: (value: string) => setSelectedVersions((prev) => ({ ...prev, [module.id]: value })),
                },
              }}
              as
              any
              moduleId={module.id}
              size="tiny"
            />
            <IconButton
              icon={<InstallIcon />}
              ariaLabel="Install module"
              onClick={() => handleInstall(module.id)}
              disabled={!selectedVersions[module.id] || !hasPermission(['MANAGE_GAMESERVERS'])}
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
          ref={installedTableRef}
          id="installed-modules"
          data={installedModules}
          columns={installedColumns}
          pagination={{
            paginationState: installedTableActions.pagination.paginationState,
            setPaginationState: installedTableActions.pagination.setPaginationState,
            pageOptions: { total: installedModules.length },
          }}
          columnFiltering={installedTableActions.columnFilters}
          columnSearch={installedTableActions.columnSearch}
          sorting={installedTableActions.sorting}
        />
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3>Available Modules</h3>
        <Table
          ref={availableTableRef}
          id="available-modules"
          data={availableModules}
          columns={availableColumns}
          pagination={{
            paginationState: availableTableActions.pagination.paginationState,
            setPaginationState: availableTableActions.pagination.setPaginationState,
            pageOptions: { total: availableModules.length },
          }}
          columnFiltering={availableTableActions.columnFilters}
          columnSearch={availableTableActions.columnSearch}
          sorting={availableTableActions.sorting}
        />
      </div>

      {openUninstallDialog && (
        <ModuleUninstallDialog
          installation={openUninstallDialog.installation}
          isOpen={true}
          onOpenChange={(open) => !open && setOpenUninstallDialog(null)}
        />
      )}
    </>
  );
};
