import { ModuleOutputDTO } from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useQuery } from 'react-query';
import { FC } from 'react';
import {
  Loading,
  Table,
  styled,
  useTableActions,
} from '@takaro/lib-components';
import { NavLink } from 'react-router-dom';
import { PATHS } from 'paths';
import { createColumnHelper } from '@tanstack/react-table';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const TableLink = styled(NavLink)<{ type: 'normal' | 'danger' }>`
  color: ${({ theme, type }) =>
    type === 'normal' ? theme.colors.primary : theme.colors.error};
`;

export const ModulesTable: FC = () => {
  const apiClient = useApiClient();
  const { pagination } = useTableActions<ModuleOutputDTO>();

  const { data, isLoading, refetch } = useQuery(
    `modules`,
    async () =>
      pagination.paginate(
        await apiClient.module.moduleControllerSearch({
          limit: pagination.paginationState.pageSize,
          page: pagination.paginationState.pageIndex,
        })
      ),
    { keepPreviousData: true }
  );

  const columnHelper = createColumnHelper<ModuleOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: ({ row }) => (
        <TableLink type="normal" to={PATHS.studio.module(row.id)}>
          {row.original.name}
        </TableLink>
      ),
    }),
    columnHelper.accessor('commands', {
      header: 'Commands',
      cell: ({ row }) => row.original.commands.length,
    }),
    columnHelper.accessor('hooks', {
      header: 'Hooks',
      cell: ({ row }) => row.original.hooks.length,
    }),
    columnHelper.accessor('cronJobs', {
      header: 'Cronjobs',
      cell: ({ row }) => row.original.cronJobs.length,
    }),
  ];

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  return (
    <TableContainer>
      <Table
        refetch={refetch}
        columns={columnDefs}
        data={data.rows}
        pagination={{
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageCount: data.pageCount,
          total: data.total,
        }}
      />
    </TableContainer>
  );
};
