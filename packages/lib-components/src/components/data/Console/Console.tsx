import {
  FC,
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useRef,
  forwardRef,
} from 'react';
import { Wrapper, Header, MessageContainer } from './style';
import { ConsoleLine } from './ConsoleLine';
import { VariableSizeList } from 'react-window';
import { Message } from './MessageModel';
import { ConsoleInput } from './ConsoleInput';
import { useConsoleLiveModeScrolling } from './useConsoleLiveMode';
import Autosizer from 'react-virtualized-auto-sizer';
import { AiOutlineDelete as ClearIcon } from 'react-icons/ai';
import { Button } from '../../../components';

const DEFAULT_LINE_HEIGHT = 25;
export const GUTTER_SIZE = 10;
/*  TODO: this does not work the scrollitemto because it has no knowledge of the padding.
 *  https://gist.github.com/ValentinJS/4f3738ed426cac183e8446c869b162dd might be an option.
 */
export const LIST_PADDING_SIZE = 0;

interface RowState {
  height: number;
  collapsed: boolean;
}

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
  const rowHeights = useRef<RowState[]>([]);

  const {
    consoleMessagesBoxRef,
    isLiveModeEnabled,
    setIsLiveModeEnabled,
    toggleLiveModeOnConsoleScroll,
  } = useConsoleLiveModeScrolling(messages);

  useEffect(() => {
    const { on, off } = listenerFactory(setMessages);
    on();

    return () => {
      off();
    };
  }, []);

  const getRowHeight = (index: number) => {
    if (rowHeights.current && rowHeights.current[index]) {
      return (
        rowHeights.current[index].height + GUTTER_SIZE || DEFAULT_LINE_HEIGHT
      );
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
  const innerElementType = forwardRef<HTMLDivElement, any>(
    ({ style, ...rest }, ref) => (
      <div
        ref={ref}
        style={{
          ...style,
          height: `${style.height + LIST_PADDING_SIZE * 2}px`,
          paddingTop: `${GUTTER_SIZE}px`,
        }}
        {...rest}
      />
    )
  );

  return (
    <Wrapper>
      <Header>
        <Button
          onClick={() => setIsLiveModeEnabled(true)}
          text="Follow"
          disabled={isLiveModeEnabled}
        />
        <Button
          onClick={() => setMessages([])}
          text="Clear"
          color="background"
          icon={<ClearIcon />}
        />
      </Header>
      <MessageContainer>
        <Autosizer>
          {({ width, height }) => {
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
                innerElementType={innerElementType}
                ref={consoleMessagesBoxRef}
              >
                {({ data, index, style }) => {
                  return (
                    <ConsoleLine
                      key={`console-line-${index}`}
                      index={index}
                      message={data[index]}
                      style={style}
                      collapsed={
                        rowHeights.current[index]
                          ? rowHeights.current[index].collapsed
                          : true
                      }
                      setRowState={setRowState}
                    />
                  );
                }}
              </VariableSizeList>
            );
          }}
        </Autosizer>
      </MessageContainer>
      <ConsoleInput
        setMessages={setMessages}
        onExecuteCommand={onExecuteCommand}
      />
    </Wrapper>
  );
};
