import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PermissionsGuard, PermissionsGuardProps, PERMISSIONS } from '.';

export default {
  title: 'Other/PermissionsGuard',
  component: PermissionsGuard,
} as Meta<PermissionsGuardProps>;

export const Default: StoryObj<typeof PermissionsGuard> = {
  args: {
    userPermissions: [PERMISSIONS.READ_USERS, PERMISSIONS.MANAGE_USERS],
    requiredPermissions: [PERMISSIONS.READ_USERS],
    children: <div>You can see this because you have 'READ_USERS' permission.</div>,
  },
};

export const NoAccess: StoryObj<typeof PermissionsGuard> = {
  args: {
    userPermissions: [PERMISSIONS.READ_USERS],
    requiredPermissions: [PERMISSIONS.MANAGE_USERS],
    children: <div>You cannot see this because you don't have 'MANAGE_USERS' permission.</div>,
  },
};

export const MultiplePermissionsRequired: StoryObj<typeof PermissionsGuard> = {
  args: {
    userPermissions: [PERMISSIONS.MANAGE_USERS, PERMISSIONS.READ_USERS],
    requiredPermissions: [[PERMISSIONS.MANAGE_USERS, PERMISSIONS.READ_USERS]],
    children: <div>You can see this because you have both 'MANAGE_USERS' and 'READ_USERS' permissions.</div>,
  },
};

export const OrPermissionsRequired: StoryObj<typeof PermissionsGuard> = {
  args: {
    userPermissions: [PERMISSIONS.MANAGE_USERS],
    // Here each inner array is an AND condition, and we have an OR condition between these sets
    requiredPermissions: [[PERMISSIONS.MANAGE_USERS], [PERMISSIONS.READ_USERS]],
    children: <div>You can see this because you have either 'MANAGE_USERS' or 'READ_USERS' permission.</div>,
  },
};
