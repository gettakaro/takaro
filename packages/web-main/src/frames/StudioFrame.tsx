import { FC, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SandpackProvider, SandpackFiles } from '@codesandbox/sandpack-react';
import { useParams } from 'react-router-dom';
import {
  CommandOutputDTO,
  CronJobOutputDTO,
  HookOutputDTO,
} from '@takaro/apiclient';
import {
  FunctionType,
  ModuleContext,
  ModuleData,
  ModuleItemProperties,
} from '../context/moduleContext';
import { useModule } from 'queries/modules';
import { styled } from '@takaro/lib-components';
import { ModuleOnboarding } from 'views/ModuleOnboarding';

const Flex = styled.div`
  display: flex;
`;

const Wrapper = styled.div`
  width: 100%;
  overflow-y: auto;
`;

/* TODO:
 * - builtin module files should be in the correct folder
 * - Add new files, rename files (=editable field)
 * - Delete files
 * - package.json (optional)
 *
 */

export const StudioFrame: FC = () => {
  // TODO: catch 404 module id does not exist errors
  const { moduleId } = useParams();
  const {
    data: mod,
    isSuccess,
    isError,
    isLoading,
    isRefetching,
  } = useModule(moduleId!);

  const [moduleData, setModuleData] = useState<ModuleData>({
    fileMap: {},
    id: '',
    name: '',
  });

  const providerModuleData = useMemo(
    () => ({ moduleData, setModuleData }),
    [moduleData, setModuleData]
  );

  const moduleItemPropertiesReducer =
    (functionType: FunctionType) =>
    (
      prev: Record<string, ModuleItemProperties>,
      item: HookOutputDTO | CronJobOutputDTO | CommandOutputDTO
    ) => {
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
      const nameToId = mod.hooks.reduce(
        moduleItemPropertiesReducer(FunctionType.Hooks),
        {}
      );
      mod.cronJobs.reduce(
        moduleItemPropertiesReducer(FunctionType.CronJobs),
        nameToId
      );
      mod.commands.reduce(
        moduleItemPropertiesReducer(FunctionType.Commands),
        nameToId
      );

      setModuleData((moduleData) => ({
        ...moduleData,
        id: mod.id,
        fileMap: nameToId,
        name: mod.name,
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

  if (isLoading || isRefetching) {
    return <></>;
  }

  if (isError) {
    return <>error</>;
  }

  if (
    isSuccess &&
    !mod.hooks.length &&
    !mod.cronJobs.length &&
    !mod.commands.length
  ) {
    return <ModuleOnboarding moduleId={moduleId!} />;
  }

  // Prevents rendering of empty sandpack
  // Because the moduleData is set asynchronously
  if (!Object.keys(moduleData.fileMap).length) {
    return <></>;
  }

  return (
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
  );
};
