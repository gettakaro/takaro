import {
  FC,
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  forwardRef,
} from 'react';
import { Wrapper } from './style';
import { styled } from '../../../styled';
import { ConsoleLine } from './ConsoleLine';
import { Message } from './MessageModel';
import { ConsoleInput } from './ConsoleInput';
import { useConsoleLiveModeScrolling } from './useConsoleLiveMode';
import { ConsolePausedAlert } from './ConsolePausedAlert';
import SimpleBar from 'simplebar-react';

export interface ConsoleProps {
  // This should spit out messages of the format Message and add it using the setter.
  listenerFactory: (s: Dispatch<SetStateAction<Message[]>>) => {
    on: () => void;
    off: () => void;
  };
  onExecuteCommand: (command: string) => Promise<Message>;
  initialMessages?: Message[];
}

export const Console: FC<ConsoleProps> = ({
  listenerFactory,
  onExecuteCommand,
  initialMessages = [],
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const { consoleMessagesBoxRef, isLiveModeEnabled, scrollNewMessages } =
    useConsoleLiveModeScrolling(messages);

  useEffect(() => {
    const { on, off } = listenerFactory(setMessages);
    on();

    return () => {
      off();
    };
  }, []);

  return (
    <Wrapper>
      <ConsoleMessagesBox ref={consoleMessagesBoxRef} messages={messages} />
      {!isLiveModeEnabled && <ConsolePausedAlert onClick={scrollNewMessages} />}
      <ConsoleInput
        setMessages={setMessages}
        onExecuteCommand={onExecuteCommand}
      />
    </Wrapper>
  );
};

const MessageBoxContainer = styled.div`
  width: 100%;
  height: 50vh;
`;

const ConsoleMessagesBox = forwardRef<HTMLDivElement, { messages: Message[] }>(
  ({ messages }, ref) => {
    return (
      <MessageBoxContainer>
        <SimpleBar
          style={{
            maxHeight: '50vh',
            height: '50vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          scrollableNodeProps={{ ref }}
        >
          {messages.map((message, index) => (
            <ConsoleLine key={`console-line-${index}`} {...message} />
          ))}
        </SimpleBar>
      </MessageBoxContainer>
    );
  }
);
