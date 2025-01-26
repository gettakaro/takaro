import { useEffect, useMemo } from 'react';
import { CommandOutputDTO, CronJobOutputDTO, FunctionOutputDTO, HookOutputDTO } from '@takaro/apiclient';
import { z } from 'zod';
import { moduleQueryOptions, moduleVersionQueryOptions } from 'queries/module';
import { styled, Skeleton } from '@takaro/lib-components';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { ModuleBuilderInner } from './-module-builder/ModuleBuilderInner';
import { ModuleOnboarding } from './-module-builder/ModuleOnboarding';
import { FileMap, FileType, ModuleBuilderProvider } from './-module-builder/useModuleBuilderStore';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { globalGameServerSetingQueryOptions } from 'queries/setting';
import { userMeQueryOptions } from 'queries/user';
import { useQueries } from '@tanstack/react-query';

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

export const Route = createFileRoute('/_auth/module-builder/$moduleId/$moduleVersionTag')({
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
  loader: async ({ params, context }) => {
    try {
      const data = await context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId));
      const version = data.versions.find((version) => version.tag === params.moduleVersionTag);

      // TODO: instead of redirecting to latest, we can redirect to a custom not found page
      // where if the module exists we can show a dropdown with the available versions.
      if (!version) {
        throw redirect({
          to: '/module-builder/$moduleId/$moduleVersionTag',
          params: { moduleId: params.moduleId, moduleVersionTag: 'latest' },
        });
      }
      return {
        moduleVersion: await context.queryClient.ensureQueryData(moduleVersionQueryOptions(version.id)),
        mod: data,
      };
    } catch (e) {
      if ((e as any).response.status === 404) {
        throw notFound();
      }
    }
  },

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
  const loaderData = Route.useLoaderData()!;
  const { file: activeFileParam } = Route.useSearch();
  const params = Route.useParams();

  const [{ data: mod }, { data: moduleVersion }] = useQueries({
    queries: [
      { ...moduleQueryOptions(params.moduleId), initialData: loaderData.mod },
      { ...moduleVersionQueryOptions(loaderData.moduleVersion.id), initialData: loaderData.moduleVersion },
    ],
  });
  useDocumentTitle(mod.name);

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
      const nameToId = mod.latestVersion.hooks
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FileType.Hooks), {});
      moduleVersion.cronJobs
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FileType.CronJobs), nameToId);
      moduleVersion.commands
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FileType.Commands), nameToId);

      moduleVersion.functions
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

  const readOnly = useMemo(() => {
    return (mod.builtin ? true : false) || moduleVersion.tag !== 'latest';
  }, [moduleVersion]);

  if (!moduleVersion.hooks.length && !moduleVersion.cronJobs.length && !moduleVersion.commands.length) {
    return <ModuleOnboarding moduleVersion={moduleVersion} />;
  }

  return (
    <ErrorBoundary>
      <ModuleBuilderProvider
        key={`${mod.id}-${moduleVersion.id}`}
        moduleId={mod.id}
        moduleName={mod.name}
        moduleVersions={mod.versions}
        fileMap={fileMap}
        readOnly={readOnly}
        versionTag={moduleVersion.tag}
        visibleFiles={activeFile ? [activeFile] : []}
        activeFile={activeFile}
        versionId={moduleVersion.id}
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
