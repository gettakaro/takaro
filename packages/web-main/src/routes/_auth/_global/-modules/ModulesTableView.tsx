import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { Table, useTableActions, IconButton, styled } from '@takaro/lib-components';
import { ModuleOutputDTO, ModuleSearchInputDTO } from '@takaro/apiclient';
import { Dropdown } from '@takaro/lib-components';
import { FC, useState } from 'react';
import {
  AiOutlineCopy as CopyIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineDownload as ExportIcon,
  AiOutlineEye as ViewIcon,
  AiOutlineTag as TagIcon,
  AiOutlineMore as ActionsIcon,
} from 'react-icons/ai';
import { Link, useNavigate } from '@tanstack/react-router';
import { getApiClient } from '../../../../util/getApiClient';
import { useHasPermission } from '../../../../hooks/useHasPermission';
import {
  ModuleCopyDialog,
  ModuleDeleteDialog,
  ModuleExportDialog,
  ModuleTagDialog,
} from '../../../../components/dialogs';

const ActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[0.5]};
  align-items: center;
  justify-content: flex-end;
`;

export const modulesQueryOptions = (queryParams: ModuleSearchInputDTO = {}) => ({
  queryKey: ['modules', queryParams],
  queryFn: async () => {
    const result = await getApiClient().module.moduleControllerSearch({ ...queryParams, extend: ['versions'] });
    return result.data;
  },
});

type ModulesTableViewProps = Record<string, never>;

export const ModulesTableView: FC<ModulesTableViewProps> = () => {
  const navigate = useNavigate();
  const [openCopyDialog, setOpenCopyDialog] = useState<{ module: ModuleOutputDTO } | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<{ module: ModuleOutputDTO } | null>(null);
  const [openExportDialog, setOpenExportDialog] = useState<{ module: ModuleOutputDTO } | null>(null);
  const [openTagDialog, setOpenTagDialog] = useState<{ module: ModuleOutputDTO } | null>(null);
  const canManageModules = useHasPermission(['MANAGE_MODULES']);

  const {
    pagination: p,
    columnFilters: f,
    sorting: s,
    columnSearch: c,
  } = useTableActions<ModuleOutputDTO>({
    pageSize: 25,
  });

  const queryParams: ModuleSearchInputDTO = {
    page: p.paginationState.pageIndex,
    limit: p.paginationState.pageSize,
    sortBy: s.sortingState.length > 0 ? s.sortingState[0].id : 'name',
    sortDirection: s.sortingState.length > 0 ? (s.sortingState[0].desc ? 'desc' : 'asc') : undefined,
    filters: {
      name: f.columnFiltersState.find((f) => f.id === 'name')?.value as string[] | undefined,
      builtin: f.columnFiltersState.find((f) => f.id === 'builtin')?.value as string[] | undefined,
    },
    search: (c.columnSearchState as any).query,
  };

  const { data } = useQuery(modulesQueryOptions(queryParams));

  const modules = data?.data || [];
  const moduleTagsMap = new Map<string, string>();

  modules.forEach((module) => {
    if (module.versions && module.versions.length > 1) {
      // Get the second tag (first non-latest tag)
      const nonLatestVersions = module.versions.filter((v) => v.tag !== 'latest');
      if (nonLatestVersions.length > 0) {
        const newestTag = nonLatestVersions[0].tag;
        moduleTagsMap.set(module.id, newestTag);
      }
    }
  });

  const columnHelper = createColumnHelper<ModuleOutputDTO>();
  const columnDefs = [
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
      header: 'Type',
      id: 'type',
      cell: ({ row }) => {
        const module = row.original;
        return module.builtin ? 'Built-in' : 'Custom';
      },
      enableColumnFilter: true,
    }),
    columnHelper.accessor('latestVersion', {
      header: 'Latest Version',
      id: 'latestVersion',
      cell: (info) => {
        const module = info.row.original;
        const versionTag = moduleTagsMap.get(module.id);
        return versionTag || info.getValue()?.tag || 'N/A';
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Commands',
      id: 'commands',
      cell: ({ row }) => {
        const module = row.original;
        return module.latestVersion?.commands?.length || 0;
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Hooks',
      id: 'hooks',
      cell: ({ row }) => {
        const module = row.original;
        return module.latestVersion?.hooks?.length || 0;
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Cronjobs',
      id: 'cronjobs',
      cell: ({ row }) => {
        const module = row.original;
        return module.latestVersion?.cronJobs?.length || 0;
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Permissions',
      id: 'permissions',
      cell: ({ row }) => {
        const module = row.original;
        return (
          module.latestVersion?.permissions?.filter((permission: any) => !permission.permission.startsWith('SYSTEM_'))
            .length || 0
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      id: 'createdAt',
      cell: (info) => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
      enableColumnFilter: false,
      enableSorting: true,
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      cell: ({ row }) => {
        const module = row.original;
        const menuItems: any[] = [];

        menuItems.push({
          label: 'View module',
          icon: <ViewIcon />,
          onClick: () => {
            navigate({ to: '/modules/$moduleId/view', params: { moduleId: module.id } });
          },
        });

        if (!module.builtin && canManageModules) {
          menuItems.push({
            label: 'Update module',
            icon: <EditIcon />,
            onClick: () => {
              navigate({
                to: '/modules/$moduleId/update',
                params: { moduleId: module.id },
                search: { view: 'builder' },
              });
            },
          });
        }

        menuItems.push({
          label: 'Copy module',
          icon: <CopyIcon />,
          onClick: () => {
            setOpenCopyDialog({ module });
          },
        });

        if (!module.builtin && canManageModules) {
          menuItems.push({
            label: 'Delete module',
            icon: <DeleteIcon />,
            onClick: () => {
              setOpenDeleteDialog({ module });
            },
          });
        }

        menuItems.push({
          label: 'Export module',
          icon: <ExportIcon />,
          onClick: () => {
            setOpenExportDialog({ module });
          },
        });

        if (!module.builtin && canManageModules) {
          menuItems.push({
            label: 'Create module tag',
            icon: <TagIcon />,
            onClick: () => {
              setOpenTagDialog({ module });
            },
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
                    key={`module-action-${index}`}
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

  const customModules = data?.data?.filter((module) => !module.builtin) || [];
  const builtinModules = data?.data?.filter((module) => module.builtin) || [];
  const allModules = [...customModules, ...builtinModules];

  return (
    <>
      <Table
        id="modules"
        data={allModules}
        columns={columnDefs}
        pagination={{
          paginationState: p.paginationState,
          setPaginationState: p.setPaginationState,
          pageOptions: p.getPageOptions(
            data || { data: [], meta: { total: 0, serverTime: Date.now().toString(), error: null as any } },
          ),
        }}
        columnFiltering={f}
        columnSearch={c}
        sorting={s}
      />

      {openCopyDialog && (
        <ModuleCopyDialog
          mod={openCopyDialog.module}
          open={true}
          onOpenChange={(open) => !open && setOpenCopyDialog(null)}
        />
      )}

      {openDeleteDialog && (
        <ModuleDeleteDialog
          moduleId={openDeleteDialog.module.id}
          moduleName={openDeleteDialog.module.name}
          open={true}
          onOpenChange={(open) => !open && setOpenDeleteDialog(null)}
        />
      )}

      {openExportDialog && (
        <ModuleExportDialog
          moduleId={openExportDialog.module.id}
          moduleName={openExportDialog.module.name}
          open={true}
          onOpenChange={(open) => !open && setOpenExportDialog(null)}
        />
      )}

      {openTagDialog && (
        <ModuleTagDialog
          moduleId={openTagDialog.module.id}
          moduleName={openTagDialog.module.name}
          open={true}
          onOpenChange={(open) => !open && setOpenTagDialog(null)}
        />
      )}
    </>
  );
};
