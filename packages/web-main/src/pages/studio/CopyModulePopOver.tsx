import { styled, Popover, IconButton, Button, TextField, FormError, errors, Alert } from '@takaro/lib-components';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';
import { useModule } from 'hooks/useModule';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { z } from 'zod';
import {
  useCommandCreate,
  useCronJobCreate,
  useHookCreate,
  useModuleCreate,
  useModule as useModuleApi,
  useModuleRemove,
} from 'queries/modules';
import { PATHS } from 'paths';
import { useState } from 'react';

const PopoverBody = styled.div`
  max-width: 400px;
  padding: ${({ theme }) => theme.spacing[2]};
`;

const PopoverHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
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

export const CopyModulePopOver = () => {
  const { moduleData } = useModule();
  const { data: mod } = useModuleApi(moduleData.id);
  const { mutateAsync: createModule, isLoading: moduleCreateLoading, error: moduleCreateError } = useModuleCreate();
  const { mutateAsync: createHook, isLoading: hookCreateLoading } = useHookCreate();
  const { mutateAsync: createCommand, isLoading: commandCreateLoading } = useCommandCreate();
  const { mutateAsync: createCronJob, isLoading: cronJobCreateLoading } = useCronJobCreate();
  const { mutateAsync: removeModule, isLoading: moduleRemoveLoading } = useModuleRemove();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormInputs>({
    defaultValues: {
      newName: `${moduleData.name}-copy`,
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormInputs> = async ({ newName }) => {
    if (!mod) {
      setError('Failed to copy module');
      return;
    }

    const createdModule = await createModule({ name: newName, configSchema: mod.configSchema });

    if (moduleCreateError) {
      const err = errors.defineErrorType(moduleCreateError);

      if (err instanceof errors.UniqueConstraintError) {
        setError('Module name already exists');
      } else {
        setError('Failed to copy module');
      }
    }

    try {
      if (!moduleCreateError) {
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
        enqueueSnackbar('Module copied successfully. ', { variant: 'default', type: 'success' });
        navigate(PATHS.studio.module(createdModule.id));
      }
    } catch (error) {
      await removeModule({ id: createdModule.id });
    }
  };

  return (
    <Popover placement="bottom">
      <Popover.Trigger asChild>
        <IconButton icon={<CopyIcon />} ariaLabel="Make copy of module" />
      </Popover.Trigger>
      <Popover.Content>
        <PopoverBody>
          <PopoverHeading>
            <h2>Copy module</h2>
          </PopoverHeading>
          <Alert
            variant="info"
            text="Copying a module copies commands with their original name. Leading to a simultaneous trigger if both modules are installed."
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              control={control}
              name="newName"
              placeholder="New Module Name"
              label="New Module Name"
              description="The copied module will contain all the same hooks, commands, and cron jobs as the original module."
              required
            />
            <Button
              isLoading={
                moduleCreateLoading ||
                hookCreateLoading ||
                commandCreateLoading ||
                cronJobCreateLoading ||
                moduleRemoveLoading
              }
              type="submit"
              icon={<CopyIcon />}
              text="Copy Module"
              fullWidth
            />
          </form>
          {error && <FormError message={error} />}
        </PopoverBody>
      </Popover.Content>
    </Popover>
  );
};
