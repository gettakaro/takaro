import { useEffect, useMemo } from 'react';
import { CommandOutputDTO, CronJobOutputDTO, HookOutputDTO } from '@takaro/apiclient';
import { moduleQueryOptions } from 'queries/modules';
import { styled, Skeleton } from '@takaro/lib-components';
import { ModuleOnboarding } from 'views/ModuleOnboarding';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { StudioInner } from './-studio/StudioInner';
import { hasPermission } from 'hooks/useHasPermission';
import { FileMap, FileType, StudioProvider } from './-studio/useStudioStore';
import { z } from 'zod';

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

export const Route = createFileRoute('/studio/$moduleId')({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isAuthenticated === false) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }

    if (!hasPermission(context.auth.session, ['MANAGE_MODULES'])) {
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
    (fileType: FileType) => (prev: FileMap, item: HookOutputDTO | CronJobOutputDTO | CommandOutputDTO) => {
      prev[`/${fileType}/${item.name}`] = {
        functionId: item.function.id,
        type: fileType,
        itemId: item.id,
        code: item.function.code,
      };
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

      return nameToId;
    }
    return {};
  }, [mod]);

  if (!mod.hooks.length && !mod.cronJobs.length && !mod.commands.length) {
    return <ModuleOnboarding moduleId={mod.id} />;
  }

  const activeFile = useMemo(() => {
    if (activeFileParam === undefined) return undefined;
    return fileMap[activeFileParam] ? activeFileParam : undefined;
  }, [fileMap, activeFileParam]);

  return (
    <ErrorBoundary>
      <StudioProvider
        moduleId={mod.id}
        moduleName={mod.name}
        fileMap={fileMap}
        readOnly={mod.builtin ? true : false}
        visibleFiles={activeFile ? [activeFile] : []}
        activeFile={activeFile}
      >
        <Flex>
          <Wrapper>
            <StudioInner />
          </Wrapper>
        </Flex>
      </StudioProvider>
    </ErrorBoundary>
  );
}
