import {
  ChangeEvent,
  createRef,
  KeyboardEvent,
  Dispatch,
  FC,
  SetStateAction,
  useState,
} from 'react';
import { Message } from '../MessageModel';
import { Container, StyledEnterIcon } from './style';
import { useSnackbar } from 'notistack';

export interface ConsoleInputProps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onExecuteCommand: (command: string) => Promise<Message>;
}

export const ConsoleInput: FC<ConsoleInputProps> = ({
  onExecuteCommand,
  setMessages,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = createRef<HTMLInputElement>();
  const [input, setInput] = useState('');
  const [commandHistoryPosition, setCommandHistoryPosition] = useState(-1);

  async function executeCommand() {
    if (input != '') {
      try {
        const message = await onExecuteCommand(input);
        setMessages((prev: Message[]) => [...prev, message]);
        const commandHistory = JSON.parse(localStorage.getItem('commandHistory') || '[]');
        commandHistory.push(input);
        localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
        setCommandHistoryPosition(-1);
      } catch {
        enqueueSnackbar('Something went wrong while executing your command.', {
          variant: 'default',
          type: 'error',
        });
      }
    }
  }

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCommandHistoryPosition(-1);
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
      setInput('');
      return;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const commandHistory = JSON.parse(localStorage.getItem('commandHistory') || '[]');
      if (commandHistoryPosition > 0) {
        setCommandHistoryPosition(commandHistoryPosition - 1);
        setInput(commandHistory[commandHistoryPosition - 1]);
      }
      return;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const commandHistory = JSON.parse(localStorage.getItem('commandHistory') || '[]');
      if (commandHistoryPosition < commandHistory.length - 1) {
        setCommandHistoryPosition(commandHistoryPosition + 1);
        setInput(commandHistory[commandHistoryPosition + 1]);
      }
      return;
    }
  };

  return (
    <Container>
      <input
        placeholder="Type here to execute a command.."
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        value={input}
        ref={inputRef}
      />
      <StyledEnterIcon fill="white" onClick={executeCommand} />
    </Container>
  );
};