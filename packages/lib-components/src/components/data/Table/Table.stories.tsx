import React from 'react';
import { Meta, StoryFn } from '@storybook/react';

import { Table, TableProps } from '.';
import { createColumnHelper } from '@tanstack/react-table';
import { Chip } from '../../../components';

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
    cell: (info) => (
      <Chip variant="outline" color="primary" label={info.getValue()} />
    ),
  }),
  columnHelper.accessor('progress', {
    id: 'progress',
    header: 'Profile Progress',
  }),
];

export default {
  component: Table,
  args: {
    sort: false,
    refetching: false,
  },
} as Meta<TableProps<User>>;

export const TableExample: StoryFn<TableProps<User>> = (args) => (
  <Table
    data={data}
    columns={columns}
    refetch={async () => {}}
    refetching={args.refetching}
  />
);
