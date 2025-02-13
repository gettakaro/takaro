import { CSSProperties, FC, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  AiFillWarning as WarningIcon,
  AiFillCloseCircle as ErrorIcon,
  AiFillBug as DebugIcon,
  AiFillInfoCircle as InfoIcon,
  AiFillMacCommand as CommandIcon,
} from 'react-icons/ai';
import { Tooltip } from '../../../../components';
import { BsChevronExpand as EnterIcon } from 'react-icons/bs';
import {
  Wrapper,
  Container,
  Body,
  Header,
  IconContainer,
  TimestampContainer,
  TextContainer,
  CollapsedContainer,
  ExpandIconContainer,
} from './style';
import { Message, MessageType } from '../MessageModel';
import { GUTTER_SIZE, LIST_PADDING_SIZE } from '../constants';

const COLLAPSED_LENGTH = 125;

interface ConsoleLineProps {
  message: Message;
  index: number;
  collapsed: boolean;
  style: CSSProperties;
  setRowState: (i: number, height: number, collapsed: boolean) => void;
}

export const ConsoleLine: FC<ConsoleLineProps> = ({ message, collapsed, style, index, setRowState }) => {
  const { data, type, timestamp } = message;

  const canCollapse = useMemo(() => {
    if (!message.data) return false;
    if (message.type === 'command') return true;

    // TODO: should calculate the max chars per line based on the font constant, font size and textcontent container
    return message.data.length > COLLAPSED_LENGTH;
  }, [index]);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed);
  const rowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setRowState(index, containerRef.current.clientHeight, isCollapsed);
    }
  }, [rowRef, isCollapsed]);

  function defineCollapsableMessageLayout(): ReactElement {
    let header = '';
    let body = '';

    if (type === 'command') {
      if (message.result == undefined) {
        throw new Error('Command messages should have a return type');
      }
      header = data;
      body = message.result;
    } else {
      // TODO: maybe the header should contain the max on line with ...
      // and the body the entire message?
      header = data.split('\n')[0];
      body = data.split('\n').slice(1).join('\n');
    }

    return (
      <CollapsedContainer>
        <Header isCollapsed={isCollapsed} type={type}>
          <p>{header}</p>
          {body && (
            <Tooltip>
              <Tooltip.Trigger asChild>
                <ExpandIconContainer>
                  <EnterIcon onClick={() => setIsCollapsed(!isCollapsed)} size={14} />
                </ExpandIconContainer>
              </Tooltip.Trigger>
              <Tooltip.Content>{isCollapsed ? 'show body' : 'collapse body'}</Tooltip.Content>
            </Tooltip>
          )}
        </Header>
        <Body isCollapsed={isCollapsed} type={type}>
          {body}
        </Body>
      </CollapsedContainer>
    );
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
    <Wrapper
      messageType={type}
      style={{
        ...style,
        top: `${(style.top as number) + GUTTER_SIZE + LIST_PADDING_SIZE}px`,
        height: `${(style.height as number) - GUTTER_SIZE}px`,
      }}
      ref={rowRef}
    >
      <Container isCollapsed={isCollapsed} ref={containerRef}>
        <IconContainer messageType={type}>{setIcon(type)}</IconContainer>
        <TimestampContainer>[{timestamp}]</TimestampContainer>
        {canCollapse ? defineCollapsableMessageLayout() : <TextContainer>{data}</TextContainer>}
      </Container>
    </Wrapper>
  );
};
