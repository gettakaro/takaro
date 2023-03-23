import { FC, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { styled, IconNavProps, IconNav } from '@takaro/lib-components';
import {
  AiFillFile as FileIcon,
  AiFillSetting as SettingsIcon,
  AiFillHome as HomeIcon,
} from 'react-icons/ai';
import { Outlet } from 'react-router-dom';
import { SandpackProvider, SandpackFiles } from '@codesandbox/sandpack-react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  CommandOutputDTO,
  CronJobOutputDTO,
  HookOutputDTO,
  ModuleOutputDTOAPI,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import {
  FunctionType,
  ModuleContext,
  ModuleData,
  ModuleItemProperties,
} from '../context/moduleContext';
import { PATHS } from 'paths';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const ContentContainer = styled(motion.div)`
  background-color: ${({ theme }): string => theme.colors.background};
  width: 100%;
  opacity: 0;
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
  const apiClient = useApiClient();
  const { moduleId } = useParams();

  const moduleItemPropertiesReducer =
    (functionType: FunctionType) =>
    (
      prev: Record<string, ModuleItemProperties>,
      item: HookOutputDTO | CronJobOutputDTO | CommandOutputDTO
    ) => {
      prev[item.name] = {
        functionId: item.function.id,
        type: functionType,
        itemId: item.id,
        code: item.function.code,
      };
      return prev;
    };

  const { data, isLoading, error, refetch, isRefetching } =
    useQuery<ModuleOutputDTOAPI>(
      `module/${moduleId}`,
      async () =>
        (await apiClient.module.moduleControllerGetOne(moduleId!)).data,
      {
        cacheTime: 0,
        onSuccess: (data) => {
          const nameToId = data.data.hooks.reduce(
            moduleItemPropertiesReducer(FunctionType.Hooks),
            {}
          );
          data.data.cronJobs.reduce(
            moduleItemPropertiesReducer(FunctionType.CronJobs),
            nameToId
          );
          data.data.commands.reduce(
            moduleItemPropertiesReducer(FunctionType.Commands),
            nameToId
          );
          setModuleData((moduleData) => ({
            ...moduleData,
            id: data.data.id,
            fileMap: nameToId,
          }));
        },
      }
    );

  const [moduleData, setModuleData] = useState<ModuleData>({
    fileMap: {},
    id: '',
  });
  const providerModuleData = useMemo(
    () => ({ moduleData, setModuleData }),
    [moduleData, setModuleData]
  );

  const navigation: IconNavProps['items'] = [
    {
      icon: <HomeIcon />,
      title: 'Home',
      to: PATHS.home(),
    },
    {
      icon: <FileIcon />,
      title: 'Explorer',
      to: '/explorer',
    },
    {
      icon: <SettingsIcon />,
      title: 'Settings',
      to: PATHS.studio.settings(module.id),
    },
  ];

  if (error) {
    console.log(error);
    return <>{error}</>;
  }

  if (
    isLoading ||
    isRefetching ||
    (moduleData && moduleData.id === undefined)
  ) {
    return <>loading..</>;
  }

  // TODO: should come from existing type
  const createComponent = async (
    componentType: 'hook' | 'cronjob' | 'command'
  ) => {
    try {
      switch (componentType) {
        case 'hook':
          await apiClient.hook.hookControllerCreate({
            eventType: 'log',
            moduleId: moduleId!,
            name: 'index.ts',
            regex: `/w/*/`,
          });

          break;
        case 'cronjob':
          await apiClient.cronjob.cronJobControllerCreate({
            name: 'index.ts',
            moduleId: moduleId!,
            temporalValue: '5 4 * * *',
          });
          break;
        case 'command':
          await apiClient.command.commandControllerCreate({
            name: 'index.ts',
            moduleId: moduleId!,
            trigger: 'test',
          });
          break;
      }
    } catch (e) {
      console.log(e);
    }
    await refetch();
  };

  /*
   * Sandpack requires atleast one file
   * In case there are none yet (no hooks, no crons and no commands)
   * We need to show a different view with a view cards
   * NOTE: This complete return and createComponent can be moved to a different file.
   */
  if (
    !data?.data.hooks.length &&
    !data?.data.cronJobs.length &&
    !data?.data.commands.length
  ) {
    return (
      <ModuleContext.Provider value={providerModuleData}>
        <div>there are no hooks no commands and no cron jobs yet.</div>

        <button
          onClick={() => {
            createComponent('hook');
          }}
        >
          create hook
        </button>
        <button
          onClick={() => {
            createComponent('cronjob');
          }}
        >
          create cronjob
        </button>
        <button
          onClick={() => {
            createComponent('command');
          }}
        >
          create command
        </button>
      </ModuleContext.Provider>
    );
  }

  const getFiles = () => {
    const files = {} as SandpackFiles;
    Object.keys(moduleData.fileMap).forEach((key) => {
      const moduleItem = moduleData.fileMap[key];
      // build path
      files[`${moduleItem.type}/${key}`] = { code: moduleItem.code };
    });

    // sandpack includes a package.json by default
    delete files['package.json'];
    return files;
  };
  const files = getFiles();

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
        <Container>
          <IconNav items={navigation} />
          <ContentContainer
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div>
              <Outlet />
            </div>
          </ContentContainer>
        </Container>
      </SandpackProvider>
    </ModuleContext.Provider>
  );
};
