import {
  RoleSearchInputDTO,
  RoleOutputArrayDTOAPI,
  RoleOutputDTO,
  RoleCreateInputDTO,
  RoleUpdateInputDTO,
  IdUuidDTO,
  IdUuidDTOAPI,
  RoleOutputDTOAPI,
  PermissionOutputDTOAPI,
  PermissionOutputDTO,
  APIOutput,
} from '@takaro/apiclient';
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useApiClient } from 'hooks/useApiClient';
import { hasNextPage } from 'queries/util';
import { useMemo } from 'react';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';
import * as Sentry from '@sentry/react';

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
};

export const useRole = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<RoleOutputDTO, AxiosError<RoleOutputDTOAPI>>({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const resp = (await apiClient.role.roleControllerGetOne(id)).data.data;
      return resp;
    },
    enabled: Boolean(id),
  });
};

export const useRoles = ({ page = 0, limit, sortBy, sortDirection, filters, search }: RoleSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const queryKeys = [...roleKeys.list(), page, sortBy, sortDirection, filters, search].filter(Boolean);

  const queryOpts = useInfiniteQuery<RoleOutputArrayDTOAPI, AxiosError<RoleOutputArrayDTOAPI>>({
    queryKey: queryKeys,
    queryFn: async ({ pageParam = page }) =>
      (
        await apiClient.role.roleControllerSearch({
          limit,
          sortBy,
          sortDirection,
          filters,
          search,
          page: pageParam,
        })
      ).data,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
    useErrorBoundary: (error) => error.response!.status >= 500,
  });

  const InfiniteScroll = useMemo(() => {
    <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const usePermissions = () => {
  const apiClient = useApiClient();

  return useQuery<PermissionOutputDTO[], AxiosError<PermissionOutputDTOAPI>>({
    queryKey: roleKeys.permissions(),
    queryFn: async () => (await apiClient.role.roleControllerGetPermissions()).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useRoleCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<RoleOutputDTO, AxiosError<RoleOutputArrayDTOAPI>, RoleCreateInputDTO>({
    mutationFn: async (role) => (await apiClient.role.roleControllerCreate(role)).data.data,
    onSuccess: async (newRole) => {
      queryClient.setQueryData<InfiniteData<RoleOutputArrayDTOAPI>>(roleKeys.list(), (prev) => {
        // in case there are no roles yet
        if (!prev) {
          return {
            pages: [
              {
                data: [newRole],
                meta: {
                  page: 0,
                  total: 1,
                  limit: 100,
                  error: { code: '', message: '', details: '' },
                  serverTime: '',
                },
              },
            ],
            pageParams: [0],
          };
        }

        const newData = {
          ...prev,
          pages: prev?.pages.map((page) => ({
            ...page,
            data: [...page.data, newRole],
          })),
        };
        return newData;
      });
    },
  });
};

interface RoleUpdate {
  roleId: string;
  roleDetails: RoleUpdateInputDTO;
}

export const useRoleUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<RoleOutputDTO, AxiosError<RoleOutputDTO>, RoleUpdate>({
    mutationFn: async ({ roleId, roleDetails }) => {
      return (await apiClient.role.roleControllerUpdate(roleId, roleDetails)).data.data;
    },
    onSuccess: async (updatedRole) => {
      try {
        // update role in list of roles
        queryClient.setQueryData<InfiniteData<RoleOutputArrayDTOAPI>>(roleKeys.list(), (prev) => {
          if (!prev) {
            queryClient.invalidateQueries(roleKeys.list());
            throw new Error('Cannot update role list, because it does not exist');
          }

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              data: page.data.map((role) => {
                if (role.id === updatedRole.id) {
                  return updatedRole;
                }
                return role;
              }),
            })),
          };
        });

        // TODO: I think we can just update the detail query instead of invalidating it
        queryClient.invalidateQueries(roleKeys.detail(updatedRole.id));
      } catch (e) {
        // TODO: pass extra context to the error
        Sentry.captureException(e);
      }
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface RoleRemove {
  id: string;
}

export const useRoleRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, RoleRemove>({
    mutationFn: async ({ id }) => (await apiClient.role.roleControllerRemove(id)).data.data,
    onSuccess: (removedRole) => {
      try {
        // update list that contain this role
        queryClient.setQueryData<InfiniteData<RoleOutputArrayDTOAPI>>(roleKeys.list(), (prev) => {
          if (!prev) {
            throw new Error('Cannot remove role from list, because list does not exist');
          }

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              data: page.data.filter((role) => role.id !== removedRole.id),
            })),
          };
        });
      } catch (e) {
        Sentry.captureException(e);
      }
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface RoleAssign {
  id: string;
  roleId: string;
  gameServerId?: string;
}

export const useRoleAssign = () => {
  const apiClient = useApiClient();

  return useMutation<APIOutput, AxiosError<APIOutput>, RoleAssign>({
    mutationFn: async ({ id, roleId, gameServerId }) =>
      (await apiClient.player.playerControllerAssignRole(id, roleId, { gameServerId })).data,
    onSuccess: () => {},
  });
};
