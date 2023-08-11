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
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);

  async function executeCommand() {
    if (input != '') {
      try {
        const message = await onExecuteCommand(input);
        setMessages((prev: Message[]) => [...prev, message]);
  
        let commandHistory = JSON.parse(localStorage.getItem('commandHistory') || '[]');
        commandHistory.push(input);
        if (commandHistory.length > 50) {
          commandHistory = commandHistory.slice(1);
        }
        localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
        setCommandHistoryIndex(-1);
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
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
      setInput('');
      return;
    }
  
    const commandHistory = JSON.parse(localStorage.getItem('commandHistory') || '[]');
    if (e.key === 'ArrowUp' && commandHistoryIndex < commandHistory.length - 1) {
      setCommandHistoryIndex(prev => prev + 1);
      setInput(commandHistory[commandHistoryIndex + 1]);
      e.preventDefault();
      return;
    }
  
    if (e.key === 'ArrowDown' && commandHistoryIndex > 0) {
      setCommandHistoryIndex(prev => prev - 1);
      setInput(commandHistory[commandHistoryIndex - 1]);
      e.preventDefault();
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