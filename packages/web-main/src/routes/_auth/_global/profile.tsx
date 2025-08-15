import { useCallback, useEffect, useState } from 'react';
import { SettingsFlow, UpdateSettingsFlowBody } from '@ory/client';
import { styled, Card, Button, Skeleton, TextField, Dialog, useTheme } from '@takaro/lib-components';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useOry } from '../../../hooks/useOry';
import { useSnackbar } from 'notistack';
import { zodValidator } from '@tanstack/zod-adapter';
import { useSession } from '../../../hooks/useSession';
import { LoginDiscordCard } from './settings/-discord/LoginDiscordCard';
import { LoginSteamCard } from './settings/-steam/LoginSteamCard';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AiOutlineWarning } from 'react-icons/ai';

export const Route = createFileRoute('/_auth/_global/profile')({
  component: Component,
  validateSearch: zodValidator(
    z.object({
      flowId: z.string().optional(),
    }),
  ),
});

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthHeader = styled.div`
  grid-column: 1 / -1;
`;

const PageHeader = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.huge};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.large};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};

  label {
    font-weight: bold;
    min-width: 120px;
  }

  span {
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const WarningBanner = styled.div`
  grid-column: 1 / -1;
  background: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const WarningHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSize.mediumLarge};
  font-weight: bold;
  color: white;
`;

const WarningText = styled.div`
  color: white;
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.5;
`;

// Form schema for email update
const emailFormSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

// Form schema for password update
const passwordFormSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

function Component() {
  useDocumentTitle('Profile Settings');
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { oryClient, oryError } = useOry();
  const [flow, setFlow] = useState<SettingsFlow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { flowId } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { session } = useSession();

  // Email form
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    setValue: setEmailValue,
    formState: { isDirty: isEmailDirty },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: '',
    },
  });
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { isDirty: isPasswordDirty },
  } = passwordForm;

  // Get the flow based on the flowId in the URL
  const getFlow = useCallback(
    (flowId: string) =>
      oryClient
        .getSettingsFlow({ id: flowId })
        .then(({ data: flow }) => setFlow(flow))
        .catch(sdkErrorHandler),
    [oryClient],
  );

  // Initialize the sdkError for generic handling of errors
  const sdkErrorHandler = oryError(getFlow, setFlow, '/profile', true);

  const createFlow = () => {
    oryClient
      .createBrowserSettingsFlow()
      .then(({ data: flow }) => {
        navigate({ search: { flowId: flow.id }, replace: true });
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  // Submit settings update to Ory
  const onSubmit = async (body: UpdateSettingsFlowBody) => {
    if (!flow) return navigate({ to: '/login', replace: true });

    setIsSubmitting(true);
    try {
      const { data: updatedFlow } = await oryClient.updateSettingsFlow({
        flow: flow.id,
        updateSettingsFlowBody: body,
      });
      setFlow(updatedFlow);
      enqueueSnackbar('Your changes have been saved', { variant: 'default', type: 'success' });

      // Refresh the flow to get updated data
      createFlow();
    } catch (error: any) {
      sdkErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email form submission
  const onEmailSubmit: SubmitHandler<EmailFormValues> = (data) => {
    if (!flow) return;

    // Find CSRF token
    const csrfNode = flow.ui.nodes.find(
      (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'csrf_token',
    );

    const body: UpdateSettingsFlowBody = {
      method: 'profile',
      traits: {
        email: data.email,
      },
    };

    if (csrfNode && 'value' in csrfNode.attributes) {
      body.csrf_token = csrfNode.attributes.value as string;
    }

    onSubmit(body);
  };

  // Handle password form submission
  const onPasswordSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    if (!flow) return;

    // Find CSRF token
    const csrfNode = flow.ui.nodes.find(
      (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'csrf_token',
    );

    const body: UpdateSettingsFlowBody = {
      method: 'password',
      password: data.password,
    };

    if (csrfNode && 'value' in csrfNode.attributes) {
      body.csrf_token = csrfNode.attributes.value as string;
    }

    await onSubmit(body);
    setShowPasswordModal(false);
    passwordForm.reset();
  };

  useEffect(() => {
    if (flowId) {
      getFlow(flowId).catch(createFlow);
      return;
    }
    createFlow();
  }, []);

  // Update form values when flow changes
  useEffect(() => {
    if (!flow) return;

    // Find email node
    const emailNode = flow.ui.nodes.find(
      (node) => node.attributes && 'name' in node.attributes && node.attributes.name === 'traits.email',
    );

    if (emailNode && 'value' in emailNode.attributes) {
      setEmailValue('email', emailNode.attributes.value as string);
    }
  }, [flow]);

  if (!flow || !session) return <Skeleton variant="rectangular" width="100%" height="400px" />;

  // Check which methods are available
  const hasProfileMethod = flow.ui.nodes.some((node) => node.group === 'profile');
  const hasPasswordMethod = flow.ui.nodes.some((node) => node.group === 'password');

  // Check if user has any authentication methods
  const hasDiscord = !!session.user.discordId;
  const hasSteam = !!session.user.steamId;
  const hasPasswordSet = session.user.hasPassword ?? false;
  const hasNoAuthMethods = !hasPasswordSet && !hasDiscord && !hasSteam;

  return (
    <Container>
      <FullWidthHeader>
        <PageHeader>Profile Settings</PageHeader>
      </FullWidthHeader>

      {/* Warning Banner for users without authentication methods */}
      {hasNoAuthMethods && (
        <WarningBanner>
          <WarningHeader>
            <AiOutlineWarning size={24} />
            No Authentication Method Configured!
          </WarningHeader>
          <WarningText>
            You currently have no way to log into your account. If you log out now, you will be locked out permanently.
            Please set up at least one authentication method immediately.
          </WarningText>
        </WarningBanner>
      )}

      {/* Left Column */}
      <div>
        {/* Account Information */}
        <Card>
          <Card.Title label="Account Information" />
          <Card.Body>
            <InfoRow>
              <label>User ID:</label>
              <span>{session.user.id}</span>
            </InfoRow>
            <InfoRow>
              <label>Display Name:</label>
              <span>{session.user.name}</span>
            </InfoRow>

            {hasProfileMethod && (
              <>
                <SectionTitle>Email Address</SectionTitle>
                <FormContainer onSubmit={handleEmailSubmit(onEmailSubmit)}>
                  <TextField
                    control={emailControl}
                    name="email"
                    label="Email"
                    type="email"
                    required
                    loading={isSubmitting}
                  />
                  <Button type="submit" isLoading={isSubmitting} disabled={!isEmailDirty || isSubmitting}>
                    Update Email
                  </Button>
                </FormContainer>
              </>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
        {/* Connected Accounts */}
        <Card>
          <Card.Title label="Connected Accounts" />
          <Card.Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
              <LoginDiscordCard session={session} />
              <LoginSteamCard session={session} />
            </div>
          </Card.Body>
        </Card>

        {/* Quick Actions */}
        {hasPasswordMethod && (
          <Card>
            <Card.Title label="Quick Actions" />
            <Card.Body>
              <Button fullWidth color="primary" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Password Change Modal */}
      {hasPasswordMethod && showPasswordModal && (
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <Dialog.Content>
            <Dialog.Heading>Change Password</Dialog.Heading>
            <Dialog.Body>
              <FormContainer onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <TextField
                  control={passwordControl}
                  name="password"
                  label="New Password"
                  type="password"
                  required
                  loading={isSubmitting}
                  placeholder="Enter new password"
                />
                <div
                  style={{
                    display: 'flex',
                    gap: theme.spacing[1],
                    justifyContent: 'flex-end',
                    marginTop: theme.spacing[2],
                  }}
                >
                  <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    isLoading={isSubmitting}
                    disabled={!isPasswordDirty || isSubmitting}
                  >
                    Update Password
                  </Button>
                </div>
              </FormContainer>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog>
      )}
    </Container>
  );
}
