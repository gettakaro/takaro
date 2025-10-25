import { Dialog, styled } from '@takaro/lib-components';
import { FC, useState } from 'react';

interface EventDetailProps {
  value: string;
}

const Button = styled.a`
  color: ${({ theme }) => theme.colors.textAlt};
  text-decoration: underline;
  cursor: pointer;
`;

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

export const VariableValueDetail: FC<EventDetailProps> = ({ value }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>View value</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <StyledContent>
          <Dialog.Heading>
            <h3>Value</h3>
          </Dialog.Heading>
          <StyledBody>
            <CodeBlock>
              <pre>{value}</pre>
            </CodeBlock>
          </StyledBody>
        </StyledContent>
      </Dialog>
    </>
  );
};
