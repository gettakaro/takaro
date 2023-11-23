import React, { FC } from 'react';
import { Meta, StoryFn } from '@storybook/react';

import { Table, TableProps } from '.';
import { createColumnHelper } from '@tanstack/react-table';
import { Chip } from '../../../components';
import { useTableActions } from '../../../hooks';

type User = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const data: User[] = [
  ...Array.from({ length: 100 }).map((_, i) => ({
    firstName: `John ${i}`,
    lastName: `Doe ${i}`,
    age: 32 + i,
    visits: 32 + i,
    status: 'complicated',
    progress: 66 + i,
  })),
];

const columnHelper = createColumnHelper<User>();
const columns = [
  columnHelper.accessor('firstName', {
    id: 'firstName',
    header: 'First Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('lastName', {
    id: 'lastName',
    header: 'Last Name',
    cell: (info) => <i>{info.getValue()}</i>,
  }),
  columnHelper.accessor('age', {
    id: 'age',
    header: 'Age',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('visits', {
    id: 'visits',
    header: 'Visits',
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Status',
    cell: (info) => <Chip variant="outline" color="primary" label={info.getValue()} />,
  }),
  columnHelper.accessor('progress', {
    id: 'progress',
    header: 'Profile Progress',
  }),
];

export default {
  title: 'Data/Table',
  component: Table,
  args: {
    sort: false,
    refetching: true,
  },
} as Meta<TableProps<User>>;

const Users: FC<TableProps<User>> = () => {
  const { pagination, sorting, columnSearch, columnFilters, rowSelection } = useTableActions<User>();

  return (
    <Table
      id="story-table"
      data={data}
      columns={columns}
      pagination={{
        paginationState: pagination.paginationState,
        setPaginationState: pagination.setPaginationState,
        pageOptions: {
          pageCount: 5,
          total: 10,
        },
      }}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      rowSelection={rowSelection}
      sorting={sorting}
    />
  );
};

export const TableExample: StoryFn<TableProps<User>> = (args) => <Users {...args} />;
