import { FC, forwardRef, useState, useMemo } from 'react';
import { CustomContentProps, useSnackbar } from 'notistack';
import {
  Container,
  ButtonContainer,
  CookieTypeContainer,
  NecessaryCookieContainer,
  Wrapper,
  ActionContainer,
} from './style';
import { Button, Switch } from '../../..';
import { Control, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { AiOutlineDown as Arrow } from 'react-icons/ai';
import { FaCookieBite as CookieBite } from 'react-icons/fa';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type FormInputs = {
  functional: boolean;
  analytical: boolean;
};

export const CookieConsentSnack = forwardRef<HTMLDivElement, CustomContentProps>(function CookieConsentSnack(
  { id },
  ref,
) {
  const { closeSnackbar } = useSnackbar();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const validationSchema = useMemo(
    () =>
      z.object({
        functional: z.boolean(),
        analytical: z.boolean(),
      }),
    [],
  );

  const onSubmit: SubmitHandler<FormInputs> = async () => {
    // TODO: send data to backend
    //const response = await fetch('', { method: 'POST', body: JSON.stringify({ analytical, functional }) });
    closeSnackbar(id);
  };

  const { control, handleSubmit } = useForm<FormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const functionalValue = useWatch({ control, name: 'functional' });
  const analyticalValue = useWatch({ control, name: 'analytical' });

  return (
    <Wrapper ref={ref}>
      <h2>
        Cookies <CookieBite size={24} />
      </h2>
      <p>
        I know, I know, its annoying. But we need to get through this! We only use cookies to guarantee you the best
        experience on our website.
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
            cookieType="functional"
            value={functionalValue}
          />
          <CookieType
            control={control}
            description="We will know where we should improve your experience."
            cookieType="analytical"
            value={analyticalValue}
          />
        </form>
      </Container>
      <div>
        {' '}
        Read the{' '}
        <strong>
          <a className="underline" href="https://takaro.io/cookie-policy" rel="noopener noreferrer" target="_blank">
            cookie policy.
          </a>
        </strong>
      </div>
      <ButtonContainer>
        <Button text="Decline" />
        <Button text="Accept" type="submit" />
      </ButtonContainer>
    </Wrapper>
  );
});

interface CookieTypeProps {
  cookieType: string;
  description: string;
  control: Control<FormInputs>;
  value: boolean;
}

const CookieType: FC<CookieTypeProps> = ({ cookieType, description, control, value }) => {
  return (
    <CookieTypeContainer active={value}>
      <div>
        <h4>{cookieType} cookies</h4>
        <p>{description}</p>
      </div>
      <Switch control={control} name={cookieType} />
    </CookieTypeContainer>
  );
};
