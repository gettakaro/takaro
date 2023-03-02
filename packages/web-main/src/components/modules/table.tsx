import { ModuleOutputArrayDTOAPI } from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useQuery } from 'react-query';
import { FC } from 'react';
import { Loading, Table, styled } from '@takaro/lib-components';
import { NavLink } from 'react-router-dom';
import { PATHS } from 'paths';

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

  const { data, isLoading } = useQuery<ModuleOutputArrayDTOAPI['data']>(
    `modules`,
    async function () {
      const data = (await apiClient.module.moduleControllerSearch()).data.data;
      return data;
    }
  );

  const columnDefs = [
    {
      headerName: 'Name',
      cellRenderer: (row) => {
        return (
          <TableLink
            type="normal"
            to={PATHS.studio.module.replace(':moduleId', row.data.id)}
          >
            {row.data.name}
          </TableLink>
        );
      },
    },
    {
      headerName: 'Commands',
      cellRenderer: (row) => {
        return row.data.commands.length;
      },
    },
    {
      headerName: 'Hooks',
      cellRenderer: (row) => {
        return row.data.hooks.length;
      },
    },
    {
      headerName: 'Cronjobs',
      cellRenderer: (row) => {
        return row.data.cronJobs.length;
      },
    },
  ];

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  return (
    <TableContainer>
      <Table
        columnDefs={columnDefs}
        rowData={data}
        width={'100%'}
        height={'400px'}
      />
    </TableContainer>
  );
};
