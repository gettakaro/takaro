import { FC, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SandpackProvider, SandpackFiles } from '@codesandbox/sandpack-react';
import { useParams, useNavigate } from 'react-router-dom';
import { CommandOutputDTO, CronJobOutputDTO, HookOutputDTO } from '@takaro/apiclient';
import { FunctionType, ModuleContext, ModuleData, ModuleItemProperties } from '../context/moduleContext';
import { useModule } from 'queries/modules';
import { styled, Skeleton } from '@takaro/lib-components';
import { ModuleOnboarding } from 'views/ModuleOnboarding';
import { PATHS } from 'paths';
import { ErrorBoundary } from 'components/ErrorBoundary';

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

/* TODO:
 * - builtin module files should be in the correct folder
 * - Add new files, rename files (=editable field)
 * - Delete files
 * - package.json (optional)
 *
 */

export const StudioFrame: FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { data: mod, isSuccess, isError, isLoading } = useModule(moduleId!);

  const [moduleData, setModuleData] = useState<ModuleData>({
    fileMap: {},
    id: '',
    name: '',
    isBuiltIn: false,
  });

  const providerModuleData = useMemo(() => ({ moduleData, setModuleData }), [moduleData, setModuleData]);

  const moduleItemPropertiesReducer =
    (functionType: FunctionType) =>
    (prev: Record<string, ModuleItemProperties>, item: HookOutputDTO | CronJobOutputDTO | CommandOutputDTO) => {
      prev[`/${functionType}/${item.name}`] = {
        functionId: item.function.id,
        type: functionType,
        itemId: item.id,
        code: item.function.code,
      };
      return prev;
    };

  useEffect(() => {
    if (isSuccess && mod) {
      // This first sorts
      const nameToId = mod.hooks
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FunctionType.Hooks), {});
      mod.cronJobs
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FunctionType.CronJobs), nameToId);
      mod.commands
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce(moduleItemPropertiesReducer(FunctionType.Commands), nameToId);

      setModuleData((moduleData) => ({
        ...moduleData,
        id: mod.id,
        fileMap: nameToId,
        name: mod.name,
        isBuiltIn: mod.builtin !== null ? true : false,
      }));
    }
  }, [mod, isSuccess]);

  const files = (() => {
    const files = {} as SandpackFiles;

    // Convert to sandpack file format
    Object.keys(moduleData.fileMap).forEach((key) => {
      const moduleItem = moduleData.fileMap[key];

      files[key] = { code: moduleItem.code };
    });

    return files;
  })();

  if (isLoading) {
    return (
      <LoadingContainer>
        <Skeleton width="100%" height="95vh" variant="text" />
        <Skeleton width="100%" height="95vh" variant="text" />
      </LoadingContainer>
    );
  }

  if (isError && !isLoading) {
    navigate(PATHS.notFound());
    return <></>;
  }

  if (isSuccess && !mod.hooks.length && !mod.cronJobs.length && !mod.commands.length) {
    return <ModuleOnboarding moduleId={moduleId!} />;
  }

  // Prevents rendering of empty sandpack
  // Because the moduleData is set asynchronously
  if (!Object.keys(moduleData.fileMap).length) {
    return <></>;
  }

  return (
    <ErrorBoundary>
      <ModuleContext.Provider value={providerModuleData}>
        <SandpackProvider
          // TODO: eventually this should point to the module config file
          customSetup={{
            entry: Object.keys(files)[0],
          }}
          files={files}
          prefix=""
        >
          <Flex>
            <Wrapper>
              <Outlet />
            </Wrapper>
          </Flex>
        </SandpackProvider>
      </ModuleContext.Provider>
    </ErrorBoundary>
  );
};
