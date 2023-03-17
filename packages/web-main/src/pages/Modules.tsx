import { createRef, FC } from 'react';
import {
  Button,
  ConfirmationModal,
  styled,
  useModal,
  useOutsideAlerter,
} from '@takaro/lib-components';
import { AiFillPlusCircle } from 'react-icons/ai';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useApiClient } from 'hooks/useApiClient';
import { PATHS } from 'paths';

const Page = styled.div`
  padding: 3rem 8rem;
  h1 {
    margin-bottom: 2rem;
  }
`;

export const Modules: FC = () => {
  const navigate = useNavigate();

  const [Wrapper, open, close] = useModal();
  const apiClient = useApiClient();
  const ref = createRef<HTMLDivElement>();
  useOutsideAlerter(ref, () => close());

  const createNewModule = async () => {
    const mod = await apiClient.module.moduleControllerCreate({
      name: new Date().toISOString(),
    });
    navigate(PATHS.studio.module.replace(':moduleId', mod.data.data.id));
  };

  return (
    <>
      <Helmet>
        <title>Modules - Takaro</title>
      </Helmet>
      <Page>
        <h1>Available modules</h1>
        <Button
          icon={<AiFillPlusCircle size={20} />}
          onClick={open}
          size="large"
          text="Create new module"
        />
        todo
        <Wrapper>
          <ConfirmationModal
            action={createNewModule}
            actionText="Create new module"
            close={close}
            description="Are you sure you want to create a new module?"
            ref={ref}
            title="Create a new module"
            type="info"
          />
        </Wrapper>
      </Page>
    </>
  );
};
