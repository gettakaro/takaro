import { Alert, Dialog, styled } from '@takaro/lib-components';
import { FC, useState } from 'react';

const StyledContent = styled(Dialog.Content)`
  min-width: 600px;
`;

const StyledBody = styled(Dialog.Body)`
  width: 100%;
  margin: 0;
  padding: ${({ theme }) => theme.spacing['1']};
  max-width: 70vw;
  max-height: 70vh;
`;

const CodeBlock = styled.code`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing['1']};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: auto;
  width: 100%;
`;

interface ConfigFieldErrorDetailProps {
  title: string;
  data: object;
  detail: string;
}

export const ConfigFieldErrorDetail: FC<ConfigFieldErrorDetailProps> = ({ data, title, detail }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Alert
        action={{
          text: 'View details',
          execute: () => {
            setOpen(true);
          },
        }}
        text={title}
        variant="error"
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <StyledContent>
          <Dialog.Heading>
            <h3>Error in config</h3>
            <p>{detail}</p>
          </Dialog.Heading>
          <StyledBody>
            <CodeBlock>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </CodeBlock>
          </StyledBody>
        </StyledContent>
      </Dialog>
    </>
  );
};
