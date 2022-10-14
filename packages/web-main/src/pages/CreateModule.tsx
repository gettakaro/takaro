import { FC, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  Select,
  TextField,
  useValidationSchema,
  styled,
  Switch,
  ErrorMessage,
  Loading,
} from '@takaro/lib-components';
import * as yup from 'yup';
import { AiFillPlusCircle, AiFillControl } from 'react-icons/ai';
import {
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTOAPI,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

import { Helmet } from 'react-helmet';

interface IFormInputs {
  name: string;
}

const Page = styled.div`
  padding: 3rem 8rem;
`;

export const ModuleCreate: FC = () => {
  const apiClient = useApiClient();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup.string().required('Must provide a name for the module.'),
      }),
    []
  );

  const { control, handleSubmit, formState, reset, watch } =
    useForm<IFormInputs>({
      mode: 'onSubmit',
      resolver: useValidationSchema(validationSchema),
    });

    const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
      console.log(data);
      try {
        await apiClient.module.moduleControllerCreate({
          name: data.name,
          enabled: true,
          config: {}
        })
        navigate(PATHS.modules.main)
      } catch (error) {
        setError(JSON.stringify(error));
      }
    };

  return (
    <>
      <Helmet>
        <title>Module create - Takaro</title>
      </Helmet>
      <Page>
        <h1>Module create</h1>
      <form onSubmit={handleSubmit(onSubmit)}>

        <TextField
          control={control}
          error={formState.errors.name}
          label="Module name"
          name="name"
          placeholder="Super cool module"
          required
        />

<ErrorMessage message={error} />


        <Button
          icon={<AiFillPlusCircle />}
          onClick={() => {
            /* dummy */
          }}
          text="Save"
          type="submit"
          variant="default"
        />
        </form>
      </Page>
    </>
  );
};
