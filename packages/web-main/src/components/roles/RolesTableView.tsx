import { RoleOutputDTO, RoleSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { Chip, Skeleton, Table, Tooltip, useTableActions } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { rolesQueryOptions } from '../../queries/role';
import { FC, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { RoleActions } from './RoleActions';
import { Link } from '@tanstack/react-router';
import { playersQueryOptions } from '../../queries/player';
import { usersQueryOptions } from '../../queries/user';
import { DocsLink } from '../../components/DocsLink';

export const RolesTableView = () => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<RoleOutputDTO>();
  const [quickSearchInput, setQuickSearchInput] = useState<string>('');

  const { data, isLoading } = useQuery({
    ...rolesQueryOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]
        ? sorting.sortingState[0]?.desc
          ? RoleSearchInputDTOSortDirectionEnum.Desc
          : RoleSearchInputDTOSortDirectionEnum.Asc
        : undefined,
      filters: {
        id: columnFilters.columnFiltersState.find((filter) => filter.id === 'id')?.value,
        name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
      },
      search: {
        name: [
          ...(columnSearch.columnSearchState.find((search) => search.id === 'name')?.value ?? []),
          quickSearchInput,
        ],
      },
    }),
  });

  const columnHelper = createColumnHelper<RoleOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('id', {
      id: 'id',
      header: 'Id',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      meta: {
        hideColumn: true,
      },
    }),
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Name',
      cell: (info) => (
        <Tooltip placement="right">
          <Tooltip.Trigger asChild>
            <Link className="underline" to="/roles/view/$roleId" params={{ roleId: info.row.original.id }}>
              {info.getValue()}
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Content>View role</Tooltip.Content>
        </Tooltip>
      ),
    }),

    columnHelper.accessor('system', {
      id: 'system',
      header: 'System',
      cell: (info) =>
        info.getValue() ? (
          <Tooltip>
            <Tooltip.Trigger>
              <Chip color="primary" label="System" />
            </Tooltip.Trigger>
            <Tooltip.Content>System roles are managed by Takaro and cannot be deleted.</Tooltip.Content>
          </Tooltip>
        ) : (
          <Chip color="backgroundAccent" label="Custom" />
        ),
      enableColumnFilter: false,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('id', {
      id: 'playerCount',
      header: 'Players with this role',
      cell: (info) => {
        return <PlayerCount roleId={info.getValue()} />;
      },
    }),
    columnHelper.accessor('id', {
      id: 'userCount',
      header: 'Users with this role',
      cell: (info) => {
        return <UserCount roleId={info.getValue()} />;
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      maxSize: 25,
      cell: (info) => {
        return (
          <RoleActions
            roleId={info.row.original.id}
            roleName={info.row.original.name}
            isSystem={info.row.original.system}
          />
        );
      },
    }),
  ];

  const p =
    !isLoading && data
      ? {
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageOptions: pagination.getPageOptions(data),
        }
      : undefined;

  return (
    <Table
      renderToolbar={() => (
        <DocsLink href="https://docs.takaro.io/roles-and-permissions" target="_blank" rel="noopener noreferrer" />
      )}
      title="List of roles"
      searchInputPlaceholder="Search by role name..."
      onSearchInputChanged={setQuickSearchInput}
      id="roles"
      columns={columnDefs}
      data={data?.data ?? []}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      sorting={sorting}
      pagination={p}
    />
  );
};

const PlayerCount: FC<{ roleId: string }> = ({ roleId }) => {
  const { data, isPending } = useQuery({
    ...playersQueryOptions({ filters: { roleId: [roleId] } }),
  });

  if (isPending) {
    return <Skeleton variant="text" width="50px" height="15px" />;
  }

  if (!data) {
    return 'unknown';
  }

  return data.meta.total;
};

const UserCount: FC<{ roleId: string }> = ({ roleId }) => {
  const { data, isPending } = useQuery({
    ...usersQueryOptions({ filters: { roleId: [roleId] } }),
  });

  if (isPending) {
    return <Skeleton variant="text" width="50px" height="15px" />;
  }

  if (!data) {
    return 'unknown';
  }

  return data.meta.total;
};
