import { styled, Popover, IconButton, Button, TextField } from '@takaro/lib-components';
import { useModule } from 'hooks/useModule';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';
import {
  useCommandCreate,
  useCronJobCreate,
  useHookCreate,
  useModuleCreate,
  useModule as useModuleApi,
  useModuleRemove,
} from 'queries/modules';
import { PATHS } from 'paths';

const Flex = styled.div`
  display: flex;
  align-items: center;

  span {
    padding-top: 0.4rem;
  }
`;

const PopoverBody = styled.div`
  max-width: 400px;
`;

const PopoverHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;
const Container = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[1]};
  text-transform: capitalize;
`;

interface FormInputs {
  newName: string;
}

export const validationSchema = z.object({
  newName: z
    .string()
    .min(4, {
      message: 'Module name requires a minimum length of 4 characters',
    })
    .max(25, {
      message: 'Module name requires a maximum length of 25 characters',
    })
    .nonempty('Module name cannot be empty'),
});

export const Header = () => {
  const { moduleData } = useModule();
  const { data: mod } = useModuleApi(moduleData.id);
  const { mutateAsync: createModule } = useModuleCreate();
  const { mutateAsync: createHook } = useHookCreate();
  const { mutateAsync: createCommand } = useCommandCreate();
  const { mutateAsync: createCronJob } = useCronJobCreate();
  const { mutateAsync: removeModule } = useModuleRemove();
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm<FormInputs>({
    defaultValues: {
      newName: `${moduleData.name}-copy`,
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormInputs> = async ({ newName }) => {
    if (!mod) {
      // TODO: throw error?
      return;
    }

    const createdModule = await createModule({ name: newName, configSchema: mod.configSchema });

    try {
      await Promise.all([
        Promise.all(
          mod.hooks.map((hook) =>
            createHook({
              moduleId: createdModule.id,
              name: hook.name,
              eventType: hook.eventType,
              regex: hook.regex ?? '',
              function: hook.function.code,
            })
          )
        ),
        Promise.all(
          mod.commands.map((command) =>
            createCommand({
              moduleId: createdModule.id,
              name: command.name,
              trigger: command.trigger,
              helpText: command.helpText,
              function: command.function.code,
              arguments: command.arguments.map((arg) => ({
                name: arg.name,
                type: arg.type,
                helpText: arg.helpText,
                position: arg.position,
              })),
            })
          )
        ),
        Promise.all(
          mod.cronJobs.map((cronJob) =>
            createCronJob({
              moduleId: createdModule.id,
              name: cronJob.name,
              temporalValue: cronJob.temporalValue,
              function: cronJob.function.code,
            })
          )
        ),
      ]);
      navigate(PATHS.studio.module(createdModule.id));
    } catch (error) {
      await removeModule({ id: createdModule.id });
      // TODO: throw error?
    }
  };

  return (
    <Container>
      <Flex>
        <span>{moduleData.name}</span>
        <Popover placement="bottom">
          <Popover.Trigger asChild>
            <IconButton icon={<CopyIcon />} ariaLabel="Copy module" />
          </Popover.Trigger>
          <Popover.Content>
            <PopoverBody>
              <PopoverHeading>
                <h2>Built-in module</h2>
              </PopoverHeading>
              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  control={control}
                  name="newName"
                  placeholder="New Module Name"
                  label="New Module Name"
                  description="This module is built-in and cannot be modified. You can copy it and make changes to the copy."
                />
                <Button type="submit" icon={<CopyIcon />} text="Copy Module" fullWidth />
              </form>
            </PopoverBody>
          </Popover.Content>
        </Popover>
      </Flex>
    </Container>
  );
};
