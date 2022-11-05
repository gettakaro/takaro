import {
  FC,
  createRef,
  useEffect,
  useState,
  Ref,
  SetStateAction,
  Dispatch,
} from 'react';
import { AiOutlineArrowDown as ArrowDownIcon } from 'react-icons/ai';
import SimpleBar from 'simplebar-react';
import { Wrapper, StyledButton, Container } from './style';
import { ConsoleLine } from './ConsoleLine';
import { Message } from './ConsoleInterface';
import { ConsoleInput } from './ConsoleInput';

/* There are still a few unsolved problems
1. When the rate of messages is very high, it sometimes does not allow you to scroll up.
It has something to do with the useEffect which scrolls the last element into the view fires faster than the unsticking event.
the [useEffect which scrolls the last elemnt into the view] should somehow be aware that a scroll up event is fired and it should wait for it to finish.
*/

export interface ConsoleProps {
  /// This should spit out messages of the format Message and add it using the setter.
  listener: (s: Dispatch<SetStateAction<Message[]>>) => void;
  onExecuteCommand: (command: string) => Promise<Message>;
  initialMessages?: Message[];
}

export const Console: FC<ConsoleProps> = ({
  listener,
  onExecuteCommand,
  initialMessages = [],
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // We want to reposition the scrollbar to the bottom when a new message arrives,
  // but only if the scrollbar is already at the bottom. We don't want to do it when the user
  // is looking for a specific log.
  const [scrollDir, setScrollDir] = useState<'down' | 'up'>('down');
  const [shouldStick, setShouldStick] = useState(true);
  const scrollableNodeRef: Ref<HTMLDivElement> = createRef();
  const bottomNodeRef: Ref<HTMLDivElement> = createRef();

  useEffect(() => {
    if (scrollableNodeRef.current) {
      const threshold = 0; // how much do we need to scroll before it is considered a directional change.
      let lastScrollY = scrollableNodeRef.current.scrollTop;
      let ticking = false;

      // check if the threshold is met or not,
      // if met specify the scroll direction based on the current and previous page offset.
      const updateScrollDir = () => {
        if (scrollableNodeRef.current) {
          const scrollY = scrollableNodeRef.current.scrollTop;
          if (Math.abs(scrollY - lastScrollY) <= threshold) {
            ticking = false;
            return;
          }
          setScrollDir(scrollY > lastScrollY ? 'down' : 'up');
          if (scrollDir === 'up') setShouldStick(false);
          lastScrollY = scrollY > 0 ? scrollY : 0;
          ticking = false;
        }
      };

      const onScroll = () => {
        if (!ticking && scrollableNodeRef.current) {
          window.requestAnimationFrame(updateScrollDir);
          // if user scrolls completely to the bottom, stick anyway
          console.log(scrollableNodeRef.current);
          if (
            scrollableNodeRef.current.scrollHeight -
              scrollableNodeRef.current.scrollTop ===
            scrollableNodeRef.current.clientHeight
          )
            setShouldStick(true);
          ticking = true;
        }
      };
      scrollableNodeRef.current?.addEventListener('scroll', onScroll);
      return () =>
        scrollableNodeRef.current?.removeEventListener('scroll', onScroll);
    }
  }, [scrollDir, messages]);

  useEffect(() => {
    listener(setMessages);
  }, []);

  useEffect(() => {
    if (shouldStick) {
      bottomNodeRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, shouldStick]);

  const stickToBottom = () => {
    setScrollDir('down');
    setShouldStick(true);
  };

  return (
    <Wrapper>
      {!shouldStick && (
        <StyledButton
          icon={<ArrowDownIcon />}
          onClick={stickToBottom}
          size="tiny"
          text="Follow new lines"
        />
      )}
      <SimpleBar
        scrollableNodeProps={{ ref: scrollableNodeRef }}
        style={{
          minHeight: '80vh',
          width: '100%',
          maxHeight: '80vh',
          overflowX: 'hidden',
        }}
      >
        <Container>
          {messages.map((message, index) => (
            <ConsoleLine key={`console-line-${index}`} {...message} />
          ))}
          {/* bottom of the view*/}
          <div ref={bottomNodeRef} />
        </Container>
      </SimpleBar>
      <ConsoleInput
        setMessages={setMessages}
        onExecuteCommand={onExecuteCommand}
      />
    </Wrapper>
  );
};
