import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PermissionsGuard, PermissionsGuardProps } from '.';
import { PERMISSIONS } from '@takaro/apiclient';
import { Alert } from '../../feedback';

export default {
  title: 'Other/PermissionsGuard',
  component: PermissionsGuard,
  decorators: [
    (story) => (
      <div>
        <Alert
          variant="warning"
          text="It is unlikely you will use THIS permissionguard directly. There should be a specific permissionguard in web-*
          application"
        ></Alert>
        {story()}
      </div>
    ),
  ],
} as Meta<PermissionsGuardProps>;

export const Default: StoryObj<typeof PermissionsGuard> = {
  args: {
    userPermissions: [PERMISSIONS.ReadUsers, PERMISSIONS.ManageUsers],
    requiredPermissions: [PERMISSIONS.ReadUsers],
    children: <div>You can see this because you have 'READ_USERS' permission.</div>,
  },
};

export const NoAccess: StoryObj<typeof PermissionsGuard> = {
  args: {
    userPermissions: [PERMISSIONS.ReadUsers],
    requiredPermissions: [PERMISSIONS.ManageUsers],
    children: <div>You cannot see this because you don't have 'MANAGE_USERS' permission.</div>,
  },
};

export const MultiplePermissionsRequired: StoryObj<typeof PermissionsGuard> = {
  args: {
    userPermissions: [PERMISSIONS.ManageUsers, PERMISSIONS.ReadUsers],
    requiredPermissions: [[PERMISSIONS.ManageUsers, PERMISSIONS.ReadUsers]],
    children: <div>You can see this because you have both 'MANAGE_USERS' and 'READ_USERS' permissions.</div>,
  },
};

export const OrPermissionsRequired: StoryObj<typeof PermissionsGuard> = {
  args: {
    userPermissions: [PERMISSIONS.ManageUsers],
    // Here each inner array is an AND condition, and we have an OR condition between these sets
    requiredPermissions: [[PERMISSIONS.ManageUsers], [PERMISSIONS.ReadUsers]],
    children: <div>You can see this because you have either 'MANAGE_USERS' or 'READ_USERS' permission.</div>,
  },
};
