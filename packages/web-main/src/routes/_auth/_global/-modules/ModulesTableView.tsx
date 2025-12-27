import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { Table, useTableActions } from '@takaro/lib-components';
import { ModuleOutputDTO, ModuleSearchInputDTO } from '@takaro/apiclient';
import { FC, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getApiClient } from '../../../../util/getApiClient';
import { ModuleActions } from './ModuleActions';
import { ModulesViewProps } from '../modules';

export const modulesQueryOptions = (queryParams: ModuleSearchInputDTO = {}) => ({
  queryKey: ['modules', queryParams],
  queryFn: async () => {
    const result = await getApiClient().module.moduleControllerSearch({ ...queryParams, extend: ['versions'] });
    return result.data;
  },
});

export const ModulesTableView: FC<ModulesViewProps> = ({ canCreateModule }) => {
  const [quickSearchInput, setQuickSearchInput] = useState<string>('');

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
    search: quickSearchInput ? { name: [quickSearchInput] } : undefined,
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
    columnHelper.accessor('author', {
      header: 'Author',
      id: 'author',
      cell: (info) => info.getValue() || 'Unknown',
      enableColumnFilter: true,
      enableSorting: true,
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
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      maxSize: 25,
      cell: ({ row }) => <ModuleActions mod={row.original} canCreateModule={canCreateModule} />,
    }),
  ];

  const customModules = data?.data?.filter((module) => !module.builtin) || [];
  const builtinModules = data?.data?.filter((module) => module.builtin) || [];
  const allModules = [...customModules, ...builtinModules];

  return (
    <Table
      id="modules"
      data={allModules}
      columns={columnDefs}
      searchInputPlaceholder="Search modules by name..."
      onSearchInputChanged={setQuickSearchInput}
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
  );
};
