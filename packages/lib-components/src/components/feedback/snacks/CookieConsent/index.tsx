import { FC, forwardRef, useState, useMemo } from 'react';
import { CustomContentProps, useSnackbar } from 'notistack';
import {
  Container,
  ButtonContainer,
  CookieTypeContainer,
  NecessaryCookieContainer,
  Wrapper,
  ActionContainer
} from './style';
import { Button, Switch } from '../../..';
import { Control, SubmitHandler, useForm } from 'react-hook-form';
import { useValidationSchema } from '../../../../hooks';
import { AiOutlineDown as Arrow } from 'react-icons/ai';
import { FaCookieBite as CookieBite } from 'react-icons/fa';
import * as yup from 'yup';

type FormInputs = {
  functional: boolean;
  analytical: boolean;
};

export const CookieConsentSnack = forwardRef<HTMLDivElement, CustomContentProps>(({ id }, ref) => {
  const { closeSnackbar } = useSnackbar();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const validationSchema = useMemo(
    () =>
      yup.object({
        functional: yup.boolean().required(),
        analytical: yup.boolean().required()
      }),
    []
  );

  const onSubmit: SubmitHandler<FormInputs> = async ({ analytical, functional }) => {
    // TODO: send data to backend
    //const response = await fetch('', { method: 'POST', body: JSON.stringify({ analytical, functional }) });
    closeSnackbar(id);
  };

  const { control, handleSubmit } = useForm<FormInputs>({
    mode: 'onSubmit',
    resolver: useValidationSchema(validationSchema)
  });

  return (
    <Wrapper ref={ref}>
      <h2>
        Cookies <CookieBite size={24} />
      </h2>
      <p>
        I know, I know, its annoying. But we need to get through this! We only use cookies to
        guarantee you the best experience on our website.
      </p>

      <ActionContainer
        active={showDetails}
        onClick={() => {
          setShowDetails(!showDetails);
        }}
      >
        customize <Arrow size={18} />
      </ActionContainer>
      <NecessaryCookieContainer>
        <p>Strictly necessary cookies</p>
        <p>Always on</p>
      </NecessaryCookieContainer>
      <Container isVisible={showDetails}>
        <form id="cookie-consent" onSubmit={handleSubmit(onSubmit)}>
          <CookieType
            control={control}
            description="We will remember the basics such as language."
            type="functional"
          />
          <CookieType
            control={control}
            description="We will know where we should improve your experience."
            type="analytical"
          />
        </form>
      </Container>
      <div>
        {' '}
        Read the{' '}
        <strong>
          <a
            className="underline"
            href="https://takaro.io/cookie-policy"
            rel="noopener noreferrer"
            target="_blank"
          >
            cookie policy.
          </a>
        </strong>
      </div>
      <ButtonContainer>
        <Button
          onClick={() => {
            /* Not sure what we should do here */
          }}
          text="Decline"
        />
        <Button
          onClick={() => {
            /* */
          }}
          text="Accept"
          type="submit"
        />
      </ButtonContainer>
    </Wrapper>
  );
});

interface CookieTypeProps {
  type: string;
  description: string;
  control: Control<FormInputs>;
}

const CookieType: FC<CookieTypeProps> = ({ type, description, control }) => {
  const defaultActive = true;
  const [active, setActive] = useState<boolean>(defaultActive);

  return (
    <CookieTypeContainer active={active}>
      <div>
        <h4>{type} cookies</h4>
        <p>{description}</p>
      </div>
      <Switch
        control={control as Control<any, any>}
        defaultValue={defaultActive}
        name={type}
        onChange={(isChecked) => setActive(isChecked)}
      />
    </CookieTypeContainer>
  );
};
