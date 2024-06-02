import { styled } from '@takaro/lib-components';
import { FC, useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, TextField, Drawer, CollapseList, TextAreaField, FormError } from '@takaro/lib-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export interface IFormInputs {
  name: string;
  data: string;
}

interface ModuleFormProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  onSubmit?: (data: IFormInputs) => void;
  error: string | string[] | null;
}

export const ModuleImportForm: FC<ModuleFormProps> = ({ isSuccess = false, onSubmit, isLoading = false, error }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const readOnly = !onSubmit;

  useEffect(() => {
    if (!open) {
      navigate({ to: '/modules' });
    }
  }, [open, navigate]);

  const { handleSubmit, control } = useForm<IFormInputs>({
    mode: 'onChange',
    defaultValues: {},
    resolver: zodResolver(z.object({ data: z.string(), name: z.string() })),
  });

  useEffect(() => {
    if (isSuccess) {
      navigate({ to: '/modules' });
    }
  }, [isSuccess]);

  const submitHandler: SubmitHandler<IFormInputs> = ({ data, name }) => {
    onSubmit!({ data, name });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>{'Import module'}</Drawer.Heading>
        <Drawer.Body>
          <form id="module-definition" onSubmit={handleSubmit(submitHandler)}>
            <CollapseList>
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool module"
                  required
                  readOnly={readOnly}
                />
                <TextAreaField
                  control={control}
                  label="Data"
                  placeholder="JSON data"
                  loading={isLoading}
                  name="data"
                  readOnly={readOnly}
                />
              </CollapseList.Item>
            </CollapseList>
            {error && <FormError error={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          {!readOnly ? (
            <ButtonContainer>
              <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
              <Button type="submit" form="module-definition" fullWidth text="Save changes" />
            </ButtonContainer>
          ) : (
            <Button text="Close view" fullWidth onClick={() => setOpen(false)} color="primary" />
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
