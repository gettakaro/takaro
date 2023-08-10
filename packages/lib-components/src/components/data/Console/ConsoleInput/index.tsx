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
  const [commandStack, setCommandStack] = useState([]); // declare commandStack state variable

  async function executeCommand() {
    if (input != '') {
      try {
        const message = await onExecuteCommand(input);
        setMessages((prev: Message[]) => [...prev, message]);
        localStorage.setItem(Date.now().toString(), input); // store the command in the local storage
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
    if (e.key === 'ArrowUp') {
      setCommandStack([...commandStack, input]); // push current input to commandStack
      const lastCommandKey = Object.keys(localStorage).sort().pop();
      const lastCommand = localStorage.getItem(lastCommandKey);
      setInput(lastCommand);
      return;
    }
    if (e.key === 'ArrowDown') {
      if (commandStack.length > 0) {
        const lastCommand = commandStack.pop();
        setInput(lastCommand);
      } else {
        setInput('');
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