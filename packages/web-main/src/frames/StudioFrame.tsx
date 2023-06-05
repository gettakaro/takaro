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
import {
  useCommandCreate,
  useCronJobCreate,
  useHookCreate,
  useModule,
} from 'queries/modules';
import { styled } from '@takaro/lib-components';
import { InfoCard, ModuleOnboarding } from 'views/ModuleOnboarding';

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
    refetch,
  } = useModule(moduleId!);

  const { mutateAsync: createHook } = useHookCreate();
  const { mutateAsync: createCommand } = useCommandCreate();
  const { mutateAsync: createCronJob } = useCronJobCreate();
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

  const [moduleData, setModuleData] = useState<ModuleData>({
    fileMap: {},
    id: '',
  });
  const providerModuleData = useMemo(
    () => ({ moduleData, setModuleData }),
    [moduleData, setModuleData]
  );

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
      }));
    }
  }, [mod, isSuccess]);

  if (isError) {
    return <>{'Module fetching failed'}</>;
  }

  // TODO: should come from existing type
  const createComponent = async (
    componentType: 'hook' | 'cronjob' | 'command'
  ) => {
    try {
      switch (componentType) {
        case 'hook':
          await createHook({
            name: 'my-hook',
            eventType: 'log',
            moduleId: moduleId!,
            regex: `/w/*/`,
          });
          break;
        case 'cronjob':
          await createCronJob({
            name: 'my-cronjob',
            moduleId: moduleId!,
            temporalValue: '5 4 * * *',
          });
          break;
        case 'command':
          await createCommand({
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

  if (isLoading || isRefetching) {
    return <></>;
  }

  /*
   * Sandpack requires atleast one file
   * In case there are none yet (no hooks, no crons and no commands)
   * We need to show a different view with a view cards
   * NOTE: This complete return and createComponent can be moved to a different file.
   */
  if (!mod?.hooks.length && !mod?.cronJobs.length && !mod?.commands.length) {
    // TODO: move this to a different file
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
          <Wrapper>
            <Outlet />
          </Wrapper>
        </Flex>
      </SandpackProvider>
    </ModuleContext.Provider>
  );
};
