import { FC } from 'react';
import { styled } from '@takaro/lib-components';
import { Helmet } from 'react-helmet';
/* import { useNavigate } from 'react-router-dom';
import { useApiClient } from 'hooks/useApiClient';
import { PATHS } from 'paths';
 */

const Page = styled.div`
  padding: 3rem 8rem;
  h1 {
    margin-bottom: 2rem;
  }
`;

export const ModuleDefinitions: FC = () => {
  /*
  const navigate = useNavigate();

  const apiClient = useApiClient();
  const ref = createRef<HTMLDivElement>();

  const createNewModule = async () => {
    const mod = await apiClient.module.moduleControllerCreate({
      name: new Date().toISOString(),
    });
    navigate(PATHS.studio.module.replace(':moduleId', mod.data.data.id));
  };*/

  return (
    <>
      <Helmet>
        <title>Modules - Takaro</title>
      </Helmet>
      <Page>
        <h1>Available modules</h1>
        todo
      </Page>
    </>
  );
};
