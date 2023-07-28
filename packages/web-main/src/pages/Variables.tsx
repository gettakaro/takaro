import { FC, Fragment, useState } from 'react';
import { Helmet } from 'react-helmet';
import { styled, Table, Loading, useTableActions, IconButton, Dropdown, Dialog, Button } from '@takaro/lib-components';
import { VariableOutputDTO, VariableSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { useVariableDelete, useVariables } from 'queries/variables';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEdit as EditIcon, AiOutlineDelete as DeleteIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const Variables: FC = () => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<VariableOutputDTO>();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [activeVar, setActiveVar] = useState<VariableOutputDTO | null>(null);

  const { data, isLoading } = useVariables({
    page: pagination.paginationState.pageIndex,
    limit: pagination.paginationState.pageSize,
    sortBy: sorting.sortingState[0]?.id,
    sortDirection: sorting.sortingState[0]?.desc
      ? VariableSearchInputDTOSortDirectionEnum.Desc
      : VariableSearchInputDTOSortDirectionEnum.Asc,
    filters: {
      key: columnFilters.columnFiltersState.find((filter) => filter.id === 'key')?.value as string,
      gameServerId: columnFilters.columnFiltersState.find((filter) => filter.id === 'gameServerId')?.value as string,
      playerId: columnFilters.columnFiltersState.find((filter) => filter.id === 'playerId')?.value as string,
      moduleId: columnFilters.columnFiltersState.find((filter) => filter.id === 'moduleId')?.value as string,
    },
    search: {
      key: columnSearch.columnSearchState.find((search) => search.id === 'key')?.value as string,
      gameServerId: columnSearch.columnSearchState.find((search) => search.id === 'gameServerId')?.value as string,
      playerId: columnSearch.columnSearchState.find((search) => search.id === 'playerId')?.value as string,
      moduleId: columnSearch.columnSearchState.find((search) => search.id === 'moduleId')?.value as string,
    },
  });

  const columnHelper = createColumnHelper<VariableOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('key', {
      header: 'Key',
      id: 'key',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('value', {
      header: 'Value',
      id: 'value',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('gameServerId', {
      header: 'Game Server',
      id: 'gameServerId',
      cell: (info) => info.row.original.gameServer?.name,
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('playerId', {
      header: 'Player',
      id: 'playerId',
      cell: (info) => info.row.original.player?.name,
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('moduleId', {
      header: 'Module',
      id: 'moduleId',
      cell: (info) => info.row.original.module?.name,
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      maxSize: 50,
      cell: (info) => (
        <Dropdown>
          <Dropdown.Trigger asChild>
            <IconButton icon={<ActionIcon />} ariaLabel="variable-actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Item label="Edit variable" icon={<EditIcon />} onClick={() => navigate('')} />
            <Dropdown.Menu.Item
              label="Delete variable"
              icon={<DeleteIcon />}
              onClick={() => {
                setActiveVar(info.row.original);
                setOpenDialog(true);
              }}
            />
          </Dropdown.Menu>
        </Dropdown>
      ),
    }),
  ];

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  return (
    <Fragment>
      <Helmet>
        <title>Variables - Takaro</title>
      </Helmet>

      <TableContainer>
        <Table
          columns={columnDefs}
          defaultDensity="relaxed"
          data={data.pages[pagination.paginationState.pageIndex].data}
          pagination={{
            ...pagination,
            pageCount: data.pages[pagination.paginationState.pageIndex].meta.page!,
            total: data.pages[pagination.paginationState.pageIndex].meta.total!,
          }}
          columnFiltering={columnFilters}
          columnSearch={columnSearch}
          sorting={sorting}
        />
      </TableContainer>

      <VariableDelete variable={activeVar} openDialog={openDialog} setOpenDialog={setOpenDialog} />
    </Fragment>
  );
};

interface IVariableDeleteProps {
  variable: VariableOutputDTO | null;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

const VariableDelete: FC<IVariableDeleteProps> = ({ variable, openDialog, setOpenDialog }) => {
  const { mutateAsync, isLoading: isDeleting } = useVariableDelete();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (variable) {
      await mutateAsync(variable.id);
      setOpenDialog(false);
    }
  };

  if (!variable) return null;

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>
          <h1>Delete variable</h1>
        </Dialog.Heading>
        <div>
          <h2>Delete variable</h2>
          <p>
            Are you sure you want to delete the variable <strong>{variable.key}</strong>? This action is irreversible!
          </p>
          <Button
            isLoading={isDeleting}
            onClick={(e) => handleOnDelete(e)}
            fullWidth
            text={'Delete variable'}
            color="error"
          />
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export default Variables;
