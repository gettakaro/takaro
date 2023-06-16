import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  DrawerContent,
  DrawerHeading,
  Drawer,
  DrawerFooter,
  DrawerBody,
  CollapseList,
  ErrorMessage,
  styled,
} from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { moduleValidationSchema } from './moduleValidationSchema';
import { useModule, useModuleUpdate } from 'queries/modules';
import { ModuleOutputDTO } from '@takaro/apiclient';

interface IFormInputs {
  name: string;
  description?: string;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

interface Props {
  mod: ModuleOutputDTO;
}

const EditModule: FC = () => {
  const { moduleId } = useParams();

  const { data, isLoading } = useModule(moduleId!);

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return <EditModuleForm mod={data} />;
};

const EditModuleForm: FC<Props> = ({ mod }) => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useModuleUpdate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.moduleDefinitions());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(moduleValidationSchema),
    defaultValues: {
      name: mod.name,
      description: mod.description,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({
    name,
    description,
  }) => {
    try {
      setError('');

      mutateAsync({
        id: mod.id,
        moduleUpdate: {
          name,
          description,
        },
      });

      navigate(PATHS.moduleDefinitions());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeading>Edit Module</DrawerHeading>
        <DrawerBody>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="edit-module-form">
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool module"
                  required
                />
                <TextField
                  control={control}
                  label="Description"
                  loading={isLoading}
                  name="description"
                  placeholder="This module does cool stuff"
                />
              </CollapseList.Item>
              {error && <ErrorMessage message={error} />}
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
              text="Save changes"
              type="submit"
              form="edit-module-form"
            />
          </ButtonContainer>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditModule;
