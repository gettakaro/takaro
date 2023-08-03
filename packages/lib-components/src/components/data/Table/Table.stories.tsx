import React, { FC, useEffect } from 'react';
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
  {
    firstName: 'John',
    lastName: 'Doe',
    age: 32,
    visits: 32,
    status: 'complicated',
    progress: 66,
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    age: 30,
    visits: 30,
    status: 'single',
    progress: 100,
  },
  {
    firstName: 'Sam',
    lastName: 'Doe',
    age: 28,
    visits: 28,
    status: 'married',
    progress: 0,
  },
  {
    firstName: 'Sally',
    lastName: 'Doe',
    age: 26,
    visits: 26,
    status: 'single',
    progress: 100,
  },
  {
    firstName: 'Bob',
    lastName: 'Doe',
    age: 24,
    visits: 24,
    status: 'single',
    progress: 100,
  },
  {
    firstName: 'Barbara',
    lastName: 'Doe',
    age: 22,
    visits: 22,
    status: 'single',
    progress: 100,
  },
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

  useEffect(() => {
    pagination.setPaginationState({
      ...pagination.paginationState,
      pageSize: 1,
    });
  }, []);

  return (
    <Table
      id="story-table"
      data={data}
      columns={columns}
      pagination={{
        ...pagination,
        pageOptions: {
          pageCount: 10,
          total: 20,
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
