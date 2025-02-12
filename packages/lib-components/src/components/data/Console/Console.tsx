import { FC, useEffect, SetStateAction, Dispatch, useRef, forwardRef } from 'react';
import { Wrapper, Header, MessageContainer } from './style';
import { ConsoleLine } from './ConsoleLine';
import { VariableSizeList } from 'react-window';
import { Message } from './MessageModel';
import { ConsoleInput } from './ConsoleInput';
import { useConsoleLiveModeScrolling } from './useConsoleLiveMode';
import Autosizer from 'react-virtualized-auto-sizer';
import { AiOutlineDelete as ClearIcon } from 'react-icons/ai';
import { Button } from '../../../components';
import { GUTTER_SIZE, LIST_PADDING_SIZE, DEFAULT_LINE_HEIGHT } from './constants';

interface RowState {
  height: number;
  collapsed: boolean;
}

export interface ConsoleProps {
  // This should spit out messages of the format Message and add it using the setter.
  listenerFactory: () => {
    on: () => void;
    off: () => void;
  };
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onExecuteCommand: (command: string) => Promise<Message>;
}

export const Console: FC<ConsoleProps> = ({ listenerFactory, onExecuteCommand, setMessages, messages }) => {
  const rowHeights = useRef<RowState[]>([]);

  const { consoleMessagesBoxRef, isLiveModeEnabled, setIsLiveModeEnabled, toggleLiveModeOnConsoleScroll } =
    useConsoleLiveModeScrolling(messages);

  useEffect(() => {
    const { on, off } = listenerFactory();
    on();

    return () => {
      off();
    };
  }, []);

  const getRowHeight = (index: number) => {
    if (rowHeights.current && rowHeights.current[index]) {
      return rowHeights.current[index].height + GUTTER_SIZE || DEFAULT_LINE_HEIGHT;
    }
    return DEFAULT_LINE_HEIGHT;
  };

  const setRowState = (index: number, height: number, collapsed: boolean) => {
    if (consoleMessagesBoxRef.current) {
      consoleMessagesBoxRef.current.resetAfterIndex(index);
    }
    rowHeights.current = {
      ...rowHeights.current,
      [index]: { height, collapsed },
    };
  };

  // this is required so that react-window knows the padding of the element
  // again, react-window does not have types, cba to type this.
  //
  const InnerElementType = forwardRef<HTMLDivElement, any>(function InnerConsole({ style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        style={{
          ...style,
          height: `${style.height + LIST_PADDING_SIZE * 2}px`,
          paddingTop: `${GUTTER_SIZE}px`,
        }}
        {...rest}
      />
    );
  });

  return (
    <Wrapper>
      <Header>
        <Button onClick={() => setIsLiveModeEnabled(true)} text="Follow" disabled={isLiveModeEnabled} />
        <Button onClick={() => setMessages([])} text="Clear" color="background" icon={<ClearIcon />} />
      </Header>
      <MessageContainer>
        <Autosizer>
          {({ width, height }: { width: number | undefined; height: number | undefined }) => {
            if (width == undefined || height == undefined) {
              return <>Could not render list</>;
            }
            return (
              <VariableSizeList
                itemCount={messages.length}
                itemSize={getRowHeight}
                itemData={messages}
                width={width}
                height={height}
                onScroll={toggleLiveModeOnConsoleScroll}
                innerElementType={InnerElementType}
                ref={consoleMessagesBoxRef}
              >
                {({ data, index, style }) => {
                  return (
                    <ConsoleLine
                      key={`console-line-${index}`}
                      index={index}
                      message={data[index]}
                      style={style}
                      collapsed={rowHeights.current[index] ? rowHeights.current[index].collapsed : false}
                      setRowState={setRowState}
                    />
                  );
                }}
              </VariableSizeList>
            );
          }}
        </Autosizer>
      </MessageContainer>
      <ConsoleInput setMessages={setMessages} onExecuteCommand={onExecuteCommand} />
    </Wrapper>
  );
};
