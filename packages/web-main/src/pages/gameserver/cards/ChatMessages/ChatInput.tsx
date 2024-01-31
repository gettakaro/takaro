import { ChangeEvent, FC, useRef, useState } from 'react';

export type ChatInputProps = {
  onSubmit: (message: string) => void;
};

export const ChatInput: FC<ChatInputProps> = ({ onSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.length > 0) {
        setInput('');
        onSubmit(input);
      }
    }
  };

  return (
    <input
      placeholder="Send a message..."
      onChange={handleOnChange}
      onKeyDown={handleOnKeyDown}
      value={input}
      ref={inputRef}
    />
  );
};
