import { useEffect, useMemo } from 'react';
import { CommandOutputDTO, CronJobOutputDTO, FunctionOutputDTO, HookOutputDTO } from '@takaro/apiclient';
import { z } from 'zod';
import { moduleQueryOptions } from 'queries/module';
import { styled, Skeleton } from '@takaro/lib-components';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { ModuleBuilderInner } from './-module-builder/ModuleBuilderInner';
import { ModuleOnboarding } from './-module-builder/ModuleOnboarding';
import { FileMap, FileType, ModuleBuilderProvider } from './-module-builder/useModuleBuilderStore';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { globalGameServerSetingQueryOptions } from 'queries/setting';
import { userMeQueryOptions } from 'queries/user';

const Flex = styled.div`
  display: flex;
`;

const Wrapper = styled.div`
  width: 100%;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  display: grid;
  grid-template-columns: 0.35fr 1fr;
  padding: ${({ theme }) => theme.spacing['2']};
  gap: ${({ theme }) => theme.spacing['4']};
`;

export const Route = createFileRoute('/_auth/module-builder/$moduleId')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    const developerModeEnabled = await context.queryClient.ensureQueryData(
      globalGameServerSetingQueryOptions('developerMode'),
    );

    if (!hasPermission(session, ['MANAGE_MODULES']) && developerModeEnabled.value == 'true') {
      throw redirect({ to: '/forbidden' });
    }
  },
  validateSearch: z.object({
    file: z.string().optional(),
  }),
  loader: ({ params, context }) => context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
  component: Component,
  pendingComponent: () => {
    return (
      <LoadingContainer>
        <Skeleton width="100%" height="95vh" variant="text" />
        <Skeleton width="100%" height="95vh" variant="text" />
      </LoadingContainer>
    );
  },
});

function Component() {
  const mod = Route.useLoaderData();
  const { file: activeFileParam } = Route.useSearch();

  useDocumentTitle(mod.name);
  // Ideally, we should only block when there are unsaved changes but for that we should first get rid of sandpack.
  useEffect(() => {
    function handleOnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      return (event.returnValue = '');
    }
    window.addEventListener('beforeunload', handleOnBeforeUnload, { capture: true });
    return () => {
      window.removeEventListener('beforeunload', handleOnBeforeUnload, { capture: true });
    };
  }, []);

  const moduleItemPropertiesReducer =
    (fileType: FileType) =>
    (prev: FileMap, item: HookOutputDTO | CronJobOutputDTO | CommandOutputDTO | FunctionOutputDTO) => {
      const path = `/${fileType}/${item.name}`;

      if (fileType === FileType.Functions) {
        prev[path] = {
          functionId: item.id,
          type: fileType,
          itemId: item.id,
          code: (item as FunctionOutputDTO).code,
        };
      } else {
        prev[path] = {
          functionId: (item as CommandOutputDTO).function.id,
          type: fileType,
          itemId: item.id,
          code: (item as CommandOutputDTO).function.code,
        };
      }
      return prev;
    };

  const fileMap = useMemo(() => {
    if (mod) {
      // This first sorts
      const nameToId = mod.hooks
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FileType.Hooks), {});
      mod.cronJobs
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FileType.CronJobs), nameToId);
      mod.commands
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FileType.Commands), nameToId);

      mod.functions
        .sort((a, b) => a.name!.localeCompare(b.name!))
        .reduce(moduleItemPropertiesReducer(FileType.Functions), nameToId);

      return nameToId;
    }
    return {};
  }, [mod]);

  const activeFile = useMemo(() => {
    if (activeFileParam === undefined) return undefined;
    return fileMap[activeFileParam] ? activeFileParam : undefined;
  }, [fileMap, activeFileParam]);

  if (!mod.hooks.length && !mod.cronJobs.length && !mod.commands.length) {
    return <ModuleOnboarding moduleId={mod.id} />;
  }

  return (
    <ErrorBoundary>
      <ModuleBuilderProvider
        moduleId={mod.id}
        moduleName={mod.name}
        fileMap={fileMap}
        readOnly={mod.builtin ? true : false}
        visibleFiles={activeFile ? [activeFile] : []}
        activeFile={activeFile}
      >
        <Flex>
          <Wrapper>
            <ModuleBuilderInner />
          </Wrapper>
        </Flex>
      </ModuleBuilderProvider>
    </ErrorBoundary>
  );
}
