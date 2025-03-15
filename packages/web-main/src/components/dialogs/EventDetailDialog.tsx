import { Dialog, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { RequiredDialogOptions } from '.';

interface EventDetailDialogProps extends RequiredDialogOptions {
  eventType: string;
  metaData: object;
}

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

export const EventDetailDialog: FC<EventDetailDialogProps> = ({ eventType, metaData, ...dialogOptions }) => {
  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <StyledContent>
          <Dialog.Heading size={4}>{eventType}</Dialog.Heading>
          <StyledBody>
            <CodeBlock>
              <pre>{JSON.stringify(metaData, null, 2)}</pre>
            </CodeBlock>
          </StyledBody>
        </StyledContent>
      </Dialog.Content>
    </Dialog>
  );
};
