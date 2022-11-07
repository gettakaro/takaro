import { FC, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { styled, IconNavProps, IconNav } from '@takaro/lib-components';
import {
  AiFillFile as FileIcon,
  AiFillSetting as SettingsIcon,
} from 'react-icons/ai';
import { Outlet } from 'react-router-dom';
import { SandpackProvider, SandpackFiles } from '@codesandbox/sandpack-react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  CronJobOutputDTO,
  HookOutputDTO,
  ModuleOutputDTOAPI,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { ModuleContext, ModuleData } from '../context/moduleContext';

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

export const StudioFrame: FC = () => {
  const apiClient = useApiClient();
  const { moduleId } = useParams();

  const { data, isLoading, error, refetch } = useQuery<ModuleOutputDTOAPI>(
    `module/${moduleId}`,
    async () => (await apiClient.module.moduleControllerGetOne(moduleId!)).data
  );
  const [moduleData, setModuleData] = useState<Partial<ModuleData>>({});
  const providerModuleData = useMemo(
    () => ({ moduleData, setModuleData }),
    [moduleData, setModuleData]
  );

  useEffect(() => {
    if (data) {
      const nameToId = data.data.hooks.reduce(nameToIdReducer, {});
      data.data.cronJobs.reduce(nameToIdReducer, nameToId);
      setModuleData({ ...moduleData, id: data.data.id, fileMap: nameToId });
    }
  }, [data]);

  const navigation: IconNavProps['items'] = [
    {
      icon: <FileIcon />,
      title: 'Explorer',
      to: '/explorer',
    },
    {
      icon: <SettingsIcon />,
      title: 'Settings',
      to: '/studio/settings',
    },
  ];

  if (error) {
    console.log(error);
    return <>error</>;
  }

  if (isLoading) {
    return <>loading..</>;
  }

  const createComponent = async (componentType: 'hook' | 'cronjob') => {
    try {
      switch (componentType) {
        case 'hook':
          await apiClient.hook.hookControllerCreate({
            eventType: 'log',
            moduleId: moduleId!,
            name: '/hooks/index.ts',
            regex: `/\w/*/`,
          });
          break;
        case 'cronjob':
          await apiClient.cronjob.cronJobControllerCreate({
            name: '/cronjobs/index.ts',
            moduleId: moduleId!,
            temporalValue: '5 4 * * *',
          });
          break;
      }
    } catch (e) {
      console.log(e);
    }
    refetch();
  };

  /*
   * Sandpack requires atleast one file
   * In case there are none yet (no hooks, no crons and no commands)
   * We need to show a different view with a view cards
   * NOTE: This complete return and createComponent can be moved to a different file.
   */
  if (!data?.data.hooks.length && !data?.data.cronJobs.length) {
    return (
      <ModuleContext.Provider value={providerModuleData}>
        <div>there are no hooks and cron jobs yet.</div>

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
      </ModuleContext.Provider>
    );
  }

  const fileNameReducer = (
    prev: SandpackFiles,
    item: HookOutputDTO | CronJobOutputDTO
  ) => {
    prev[item.name] = { code: item.function.code };
    return prev;
  };

  const nameToIdReducer = (
    prev: Record<string, string>,
    item: HookOutputDTO | CronJobOutputDTO
  ) => {
    prev[item.name] = item.id;
    return prev;
  };

  const getFiles = () => {
    const files = data.data.hooks.reduce(fileNameReducer, {});
    data.data.cronJobs.reduce(fileNameReducer, files);

    /* filemap:
     * although the filename is unique for a module it is not unique globally.
     * We need to use the associated ids (hookId, cronId)
     */

    console.log(files);
    return files;
  };

  return (
    <ModuleContext.Provider value={providerModuleData}>
      <SandpackProvider
        customSetup={{ entry: '/cronjobs/new_dir_name/temp.test.ts' }}
        files={getFiles()}
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
