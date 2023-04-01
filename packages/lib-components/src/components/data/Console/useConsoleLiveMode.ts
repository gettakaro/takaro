import { useCallback, useEffect, useRef, useState } from 'react';
import { Message } from './MessageModel';

export function useConsoleLiveModeScrolling<T extends HTMLDivElement>(
  messages: Message[]
) {
  const [isLiveModeEnabled, setIsLiveModeEnabled] = useState<boolean>(true);
  const consoleMessagesBoxRef = useRef<T | null>(null);

  const scrollNewMessages = useCallback(() => {
    consoleMessagesBoxRef.current?.lastElementChild?.scrollIntoView();
  }, []);

  const toggleLiveModeOnConsoleScroll = useCallback(() => {
    if (consoleMessagesBoxRef.current) {
      const scrollHeight = consoleMessagesBoxRef.current.scrollHeight;
      const scrollTop = consoleMessagesBoxRef.current.scrollTop;
      const clientHeight = consoleMessagesBoxRef.current.clientHeight;

      const currentScroll = Math.ceil(clientHeight + scrollTop);
      const isConsoleScrolled = currentScroll !== scrollHeight;

      setIsLiveModeEnabled(!isConsoleScrolled);
    }
  }, []);

  useEffect(() => {
    const ref = consoleMessagesBoxRef.current;
    ref?.addEventListener('scroll', toggleLiveModeOnConsoleScroll);
    return () =>
      ref?.removeEventListener('scroll', toggleLiveModeOnConsoleScroll);
  }, [toggleLiveModeOnConsoleScroll]);

  useEffect(() => {
    if (isLiveModeEnabled) {
      scrollNewMessages();
    }
  }, [messages, isLiveModeEnabled, scrollNewMessages]);

  return {
    consoleMessagesBoxRef,
    isLiveModeEnabled,
    scrollNewMessages,
  };
}
