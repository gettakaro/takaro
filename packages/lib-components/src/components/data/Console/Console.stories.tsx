import { Meta, Story } from '@storybook/react';
import { Dispatch, SetStateAction } from 'react';
import { Console as ConsoleComponent } from '../Console';
import { Message, MessageType } from './ConsoleInterface';

export default {
  title: 'Data/Console',
  component: ConsoleComponent,
} as Meta;

const MessageTypeMap: MessageType[] = [
  'command',
  'info',
  'debug',
  'warning',
  'error',
];

export const Console: Story = () => {
  function listenerFactory(setter: Dispatch<SetStateAction<Message[]>>) {
    const interval = setInterval(() => {
      const r = Math.floor(Math.random() * 5);
      const newMessage: Message = {
        data: `this is a ${MessageTypeMap[r]} logline`,
        timestamp: new Date().toISOString(),
        type: MessageTypeMap[r],
      };

      setter((prev: Message[]) => [...prev, newMessage]);
    }, 1000);

    return {
      on: () => {
        /* Nothing to do here */
      },
      off: () => clearInterval(interval),
    };
  }

  return (
    <ConsoleComponent
      listenerFactory={listenerFactory}
      onExecuteCommand={async () => {
        return {
          type: 'command',
          data: 'response here',
          timestamp: new Date().toISOString(),
        };
      }}
    />
  );
};
