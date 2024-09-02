import { FC, Fragment, useMemo, useState } from 'react';
import {
  Table,
  useTableActions,
  IconButton,
  Dropdown,
  Button,
  Divider,
  DateFormatter,
  CopyId,
} from '@takaro/lib-components';
import { VariableOutputDTO, VariableSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { variablesQueryOptions } from 'queries/variable';
import { AiOutlineEdit as EditIcon, AiOutlineDelete as DeleteIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { VariableValueDetail } from './-variables/VariableValueDetail';
import { VariableDeleteDialog } from './-variables/VariableDeleteDialog';
import { VariablesDeleteDialog } from './-variables/VariablesDeleteDialog';
import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/variables')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_VARIABLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  useDocumentTitle('Variables');
  const { pagination, columnFilters, sorting, columnSearch, rowSelection } = useTableActions<VariableOutputDTO>();
  const navigate = useNavigate();
  const [openVariablesDialog, setOpenVariablesDialog] = useState<boolean>(false);

  const { data, isLoading } = useQuery({
    ...variablesQueryOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      sortBy: sorting.sortingState[0]?.id,
      extend: ['module', 'player', 'gameServer'],
      sortDirection: sorting.sortingState[0]
        ? sorting.sortingState[0]?.desc
          ? VariableSearchInputDTOSortDirectionEnum.Desc
          : VariableSearchInputDTOSortDirectionEnum.Asc
        : undefined,
      filters: {
        key: columnFilters.columnFiltersState.find((filter) => filter.id === 'key')?.value,
        gameServerId: columnFilters.columnFiltersState.find((filter) => filter.id === 'gameServerId')?.value,
        playerId: columnFilters.columnFiltersState.find((filter) => filter.id === 'playerId')?.value,
        moduleId: columnFilters.columnFiltersState.find((filter) => filter.id === 'moduleId')?.value,
      },
      search: {
        key: columnSearch.columnSearchState.find((search) => search.id === 'key')?.value,
        gameServerId: columnSearch.columnSearchState.find((search) => search.id === 'gameServerId')?.value,
        playerId: columnSearch.columnSearchState.find((search) => search.id === 'playerId')?.value,
        moduleId: columnSearch.columnSearchState.find((search) => search.id === 'moduleId')?.value,
      },
    }),
  });

  const columnHelper = createColumnHelper<VariableOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('key', {
      header: 'Key',
      id: 'key',
      meta: { dataType: 'string' },
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('value', {
      header: 'Value',
      id: 'value',
      cell: (info) => (info.getValue().length > 10 ? <VariableValueDetail value={info.getValue()} /> : info.getValue()),
      enableColumnFilter: false,
    }),
    columnHelper.accessor('gameServerId', {
      header: 'Game Server',
      id: 'gameServerId',
      meta: { dataType: 'uuid' },
      cell: (info) => (
        <CopyId
          id={info.row.original.gameServer?.id}
          placeholder={info.row.original.gameServer?.name}
          copyText="copied gameServerId"
        />
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('playerId', {
      header: 'Player',
      id: 'playerId',
      meta: { dataType: 'uuid' },
      cell: (info) => (
        <CopyId
          id={info.row.original.player?.id}
          placeholder={info.row.original.player?.name}
          copyText="copied playerId"
        />
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('moduleId', {
      header: 'Module',
      id: 'moduleId',
      meta: { dataType: 'uuid' },
      cell: (info) => (
        <CopyId
          id={info.row.original.module?.id}
          placeholder={info.row.original.module?.name}
          copyText="copied moduleId"
        />
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      meta: { dataType: 'datetime' },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      meta: { dataType: 'datetime' },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),
    columnHelper.accessor('expiresAt', {
      header: 'Expires at',
      id: 'expiresAt',
      meta: { dataType: 'datetime' },
      cell: (info) => {
        const value = info.getValue();

        if (!value) return 'Never';
        return <DateFormatter ISODate={value} />;
      },
      enableSorting: false,
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
      cell: (info) => <VariableMenu variable={info.row.original} />,
    }),
  ];

  const selectedVariableIds = useMemo(() => {
    if (!data || Object.keys(rowSelection.rowSelectionState).length === 0) return [];
    const idxs = Object.keys(rowSelection.rowSelectionState).filter((key) => rowSelection.rowSelectionState[key]);
    return idxs
      .map((idx) => data.data.at(idx as unknown as number))
      .filter((v) => v !== undefined)
      .map((v) => v!.id);
  }, [rowSelection.rowSelectionState, data]);

  // since pagination depends on data, we need to make sure that data is not undefined
  const p =
    !isLoading && data
      ? {
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageOptions: pagination.getPageOptions(data),
        }
      : undefined;

  return (
    <Fragment>
      <p>
        Variables allow you to store data in a key-value format, which is persisted between module runs. For example,
        variables are the way that the teleports module stores the teleport locations.
      </p>
      <Divider size="large" />
      <Table
        title="List of variables"
        renderToolbar={() => {
          return (
            <Button
              text="Create variable"
              onClick={() => {
                navigate({ to: '/variables/create' });
              }}
            />
          );
        }}
        renderRowSelectionActions={() => {
          return (
            <Button
              text={`Delete variables (${selectedVariableIds.length})`}
              onClick={() => {
                setOpenVariablesDialog(true);
              }}
            />
          );
        }}
        id="variables"
        columns={columnDefs}
        rowSelection={rowSelection}
        data={data ? data?.data : []}
        pagination={p}
        columnFiltering={columnFilters}
        columnSearch={columnSearch}
        sorting={sorting}
      />
      <Outlet />
      <VariablesDeleteDialog
        variableIds={selectedVariableIds}
        openDialog={openVariablesDialog}
        setOpenDialog={setOpenVariablesDialog}
      />
    </Fragment>
  );
}

const VariableMenu: FC<{ variable: VariableOutputDTO }> = ({ variable }) => {
  const [openVariableDialog, setOpenVariableDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger asChild>
          <IconButton icon={<ActionIcon />} ariaLabel="variable-actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Item
            label="Edit variable"
            icon={<EditIcon />}
            onClick={() => navigate({ to: '/variables/update/$variableId', params: { variableId: variable.id } })}
          />
          <Dropdown.Menu.Item
            label="Delete variable"
            icon={<DeleteIcon />}
            onClick={() => {
              setOpenVariableDialog(true);
            }}
          />
        </Dropdown.Menu>
      </Dropdown>
      <VariableDeleteDialog variable={variable} openDialog={openVariableDialog} setOpenDialog={setOpenVariableDialog} />
    </>
  );
};
