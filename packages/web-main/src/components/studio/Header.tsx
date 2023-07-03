import { styled, Popover, IconButton, Button, TextField, Chip } from '@takaro/lib-components';
import { useModule } from 'hooks/useModule';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AiOutlineLock as ReadOnlyIcon, AiOutlineCopy as CopyIcon } from 'react-icons/ai';

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

  const { control, handleSubmit } = useForm<FormInputs>({
    defaultValues: {
      newName: `${moduleData.name}-copy`,
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormInputs> = ({ newName }) => {
    // TODO: Copy module + redirect studio to newly created module
    console.log('this is fired', newName);
  };

  return (
    <Container>
      <Flex>
        <span>{moduleData.name}</span>
        {moduleData.isBuiltIn && (
          <Popover placement="bottom">
            <Popover.Trigger asChild>
              <IconButton icon={<ReadOnlyIcon />} ariaLabel="Read only" />
            </Popover.Trigger>
            <Popover.Content>
              <PopoverBody>
                <PopoverHeading>
                  <h2>Built-in module</h2>
                  <Chip color="primary" variant="default" label="feature is coming soon." />
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
        )}
      </Flex>
    </Container>
  );
};
