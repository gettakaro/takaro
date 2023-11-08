import { Dialog, styled } from '@takaro/lib-components';
import { FC, useState } from 'react';

type EventDetailProps = {
  eventType: string;
  metaData: object;
};

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

export const EventDetail: FC<EventDetailProps> = ({ eventType, metaData }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>details</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <StyledContent>
          <Dialog.Heading>
            <h3>{eventType}</h3>
          </Dialog.Heading>
          <StyledBody>
            <CodeBlock>
              <pre>{JSON.stringify(metaData, null, 2)}</pre>
            </CodeBlock>
          </StyledBody>
        </StyledContent>
      </Dialog>
    </>
  );
};
