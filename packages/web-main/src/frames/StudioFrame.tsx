import { FC, useMemo, useState } from 'react';
import {
  styled,
  IconNavProps,
  IconNav,
  ModuleOnboarding,
} from '@takaro/lib-components';
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
import { InfoCard } from '@takaro/lib-components/src/views/ModuleOnboarding';

const Flex = styled.div`
  display: flex;
  height: 100%;
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
  const apiClient = useApiClient();
  const { moduleId } = useParams();

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
      to: PATHS.studio.settings(moduleId ?? ''),
    },
  ];

  if (error) {
    console.error(error);
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
            name: 'my-hook',
            regex: `/w/*/`,
          });
          break;
        case 'cronjob':
          await apiClient.cronjob.cronJobControllerCreate({
            name: 'my-cronjob',
            moduleId: moduleId!,
            temporalValue: '5 4 * * *',
          });
          break;
        case 'command':
          await apiClient.command.commandControllerCreate({
            name: 'my-command',
            moduleId: moduleId!,
            trigger: 'test',
          });
          break;
      }
    } catch (e) {
      console.error(e);
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
        <ModuleOnboarding>
          <InfoCard
            title="Commands"
            onClick={async () => await createComponent('command')}
          >
            Commands are triggered by a user. They are triggered when a player
            sends a chat message starting with the configured command prefix.
            Note that this means that commands are a manual action, unlike Hooks
            and Cronjobs which are triggered with any user-intervention.
          </InfoCard>
          <InfoCard
            title="Hooks"
            onClick={async () => await createComponent('hook')}
          >
            Hooks are triggered when a certain event happens on a Gameserver.
            Think of it as a callback function that is executed when a certain
            event happens. For example, when a player joins a server, a Hook can
            be triggered that will send a message to the player.
          </InfoCard>
          <InfoCard
            title="CronJobs"
            onClick={async () => await createComponent('cronjob')}
          >
            Cronjobs are triggered based on time. This can be a simple repeating
            pattern like "Every 5 minutes" or "Every day" or you can use raw
            Cron (opens in a new tab) syntax to define more complex patterns
            like "Every Monday, Wednesday and Friday at 2 PM";
          </InfoCard>
        </ModuleOnboarding>
      </ModuleContext.Provider>
    );
  }

  const getFiles = () => {
    const files = {} as SandpackFiles;

    // Convert to sandpack file format
    Object.keys(moduleData.fileMap).forEach((key) => {
      const moduleItem = moduleData.fileMap[key];

      files[key] = { code: moduleItem.code };
    });

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
        <Flex>
          <IconNav items={navigation} />
          <Wrapper>
            <Outlet />
          </Wrapper>
        </Flex>
      </SandpackProvider>
    </ModuleContext.Provider>
  );
};
