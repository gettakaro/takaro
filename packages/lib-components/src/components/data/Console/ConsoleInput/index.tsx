import { ChangeEvent, useRef, KeyboardEvent, Dispatch, FC, SetStateAction, useState } from 'react';
import { Message } from '../MessageModel';
import { Container, StyledEnterIcon } from './style';
import { useSnackbar } from 'notistack';

export interface ConsoleInputProps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onExecuteCommand: (command: string) => Promise<Message>;
}

export const ConsoleInput: FC<ConsoleInputProps> = ({ onExecuteCommand, setMessages }) => {
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);

  async function executeCommand() {
    if (input != '') {
      try {
        const message = await onExecuteCommand(input);
        setMessages((prev: Message[]) => [...prev, message]);

        const commandHistory = JSON.parse(localStorage.getItem('commandHistory') || '[]');
        commandHistory.unshift(input);
        if (commandHistory.length > 50) {
          commandHistory.pop();
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

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistoryIndex >= -1 && commandHistoryIndex < commandHistory.length) {
        setCommandHistoryIndex((prevIndex) => prevIndex + 1); // move backwards in command history
        setInput(commandHistory[commandHistoryIndex + 1]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistoryIndex > 0) {
        setCommandHistoryIndex((prevIndex) => prevIndex - 1); // move forward in command history
        setInput(commandHistory[commandHistoryIndex - 1]);
      } else if (commandHistoryIndex === 0) {
        setCommandHistoryIndex(-1);
        setInput(''); // Clear input if moving beyond available commands
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
