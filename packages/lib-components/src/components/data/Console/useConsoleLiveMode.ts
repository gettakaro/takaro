import { useCallback, useEffect, useRef, useState } from 'react';
import { Message } from './MessageModel';

export function useConsoleLiveModeScrolling(messages: Message[]) {
  const [isLiveModeEnabled, setIsLiveModeEnabled] = useState<boolean>(true);
  const [scrollOffset, setScrollOffset] = useState<number>(0);

  // unfortunately the react-window libraries does not have up to date types
  const consoleMessagesBoxRef = useRef<null | any>(null);

  // scrolls to the latest message
  const scrollNewMessages = useCallback(() => {
    consoleMessagesBoxRef.current?.scrollToItem(messages.length, 'end');
  }, [messages]);

  const toggleLiveModeOnConsoleScroll = useCallback(() => {
    if (consoleMessagesBoxRef.current) {
      // in case we are scrolling down, don't do anything.
      if (consoleMessagesBoxRef.current.state.scrollDirection === 'forward') {
        return;
      }

      if (consoleMessagesBoxRef.current.state.scrollOffset < scrollOffset) {
        setIsLiveModeEnabled(false);
      }
      setScrollOffset(consoleMessagesBoxRef.current.state.scrollOffset);
    }
  }, [scrollOffset]);

  useEffect(() => {
    if (isLiveModeEnabled) {
      scrollNewMessages();
    }
  }, [messages, isLiveModeEnabled, scrollNewMessages]);

  return {
    consoleMessagesBoxRef,
    isLiveModeEnabled,
    setIsLiveModeEnabled,
    toggleLiveModeOnConsoleScroll,
  };
}
