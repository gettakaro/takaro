import { FC, ReactElement, useState } from 'react';
import {
  AiFillWarning as WarningIcon,
  AiFillCloseCircle as ErrorIcon,
  AiFillBug as DebugIcon,
  AiFillInfoCircle as InfoIcon,
  AiFillMacCommand as CommandIcon,
} from 'react-icons/ai';
import {
  Wrapper,
  Container,
  Body,
  Header,
  IconContainer,
  TimestampContainer,
  TextContainer,
  CollapsedContainer,
  StyledExpandIcon,
} from './style';
import { Message, MessageType } from '../ConsoleInterface';

const COLLAPSED_LENGTH = 125;

function shouldCollapse(message: Message) {
  if (!message.data) return false;
  if (message.type === 'command') return true;
  if (message.trace) return true;
  return message.data.length > COLLAPSED_LENGTH;
}

export const ConsoleLine: FC<Message> = (message) => {
  const { data, type, trace, timestamp } = message;
  const canCollapse = shouldCollapse(message);
  const [isCollapsed, setCollapsed] = useState<boolean>(canCollapse);

  function defineCollapsableMessageLayout(): ReactElement {
    let header = '';
    let body = '';

    if (type === 'command') {
      header = 'command here';
      body = data;
    } else if (trace) {
      header = data;
      body = trace;
    } else {
      header = data.split('\n')[0];
      body = data.split('\n').slice(1).join('\n');
    }

    return (
      <CollapsedContainer>
        <Header isCollapsed={isCollapsed} type={type}>
          <p>{header}</p>
          {body && <StyledExpandIcon size={15} />}
        </Header>
        <Body isCollapsed={isCollapsed} type={type}>
          {body}
        </Body>
      </CollapsedContainer>
    );
  }

  function onClick() {
    if (canCollapse) {
      const selection = window.getSelection();
      if (selection?.type !== 'Range') {
        setCollapsed(!isCollapsed);
      }
    }
  }

  const setIcon = (messageType: MessageType): ReactElement => {
    switch (messageType) {
      case 'info':
        return <InfoIcon size={14} />;
      case 'warning':
        return <WarningIcon size={14} />;
      case 'debug':
        return <DebugIcon size={14} />;
      case 'error':
        return <ErrorIcon size={14} />;
      case 'command':
        return <CommandIcon size={14} />;
    }
  };

  return (
    <Wrapper canCollapse={canCollapse} messageType={type}>
      <Container isCollapsed={isCollapsed} onClick={onClick}>
        <IconContainer messageType={type}>{setIcon(type)}</IconContainer>
        <TimestampContainer>[{timestamp}]</TimestampContainer>
        {canCollapse ? (
          defineCollapsableMessageLayout()
        ) : (
          <TextContainer>{data}</TextContainer>
        )}
      </Container>
    </Wrapper>
  );
};
