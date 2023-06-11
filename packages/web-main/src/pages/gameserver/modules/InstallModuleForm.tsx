import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  DrawerContent,
  DrawerHeading,
  Drawer,
  DrawerFooter,
  DrawerBody,
  CollapseList,
  styled,
} from '@takaro/lib-components';

import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { useGameServerModuleInstall } from 'queries/gameservers';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

interface IFormInputs {}

const InstallModule: FC = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useGameServerModuleInstall();
  const { serverId, moduleId } = useParams();

  if (!serverId || !moduleId) {
    throw new Error('No serverId or moduleId');
  }

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServer.modules(serverId));
    }
  }, [open, navigate, serverId]);

  const { handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    //  resolver: zodResolver(moduleValidationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async () => {
    try {
      mutateAsync({
        gameServerId: serverId,
        moduleId: moduleId,
        moduleInstall: {
          systemConfig: JSON.stringify({}),
          userConfig: JSON.stringify({}),
        },
      });

      navigate(PATHS.gameServer.modules(serverId));
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeading>Install Module</DrawerHeading>
        <DrawerBody>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="install-module-form">
              TODO: generic config via json schema
            </form>
          </CollapseList>
        </DrawerBody>
        <DrawerFooter>
          <ButtonContainer>
            <Button
              text="Cancel"
              onClick={() => setOpen(false)}
              color="background"
            />
            <Button
              fullWidth
              isLoading={isLoading}
              text="Install"
              type="submit"
              form="install-module-form"
            />
          </ButtonContainer>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default InstallModule;
