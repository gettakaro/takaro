import { useCallback, useEffect, useRef, useState } from 'react';

export function useChatAutoScroll<T>(messages: T[]) {
  const [isFollowEnabled, setIsFollowEnabled] = useState<boolean>(true);
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scrolls to the bottom of the chat
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  // Checks if user is at the bottom of the chat
  const isAtBottom = useCallback(() => {
    if (!scrollContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 5; // 5px tolerance
  }, []);

  // Handles scroll events to detect when user scrolls up
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const currentScrollTop = scrollContainerRef.current.scrollTop;

    // If user scrolled up, disable follow mode
    if (currentScrollTop < lastScrollTop && isFollowEnabled) {
      setIsFollowEnabled(false);
    }

    // If user scrolled to bottom, re-enable follow mode
    if (isAtBottom() && !isFollowEnabled) {
      setIsFollowEnabled(true);
    }

    setLastScrollTop(currentScrollTop);
  }, [lastScrollTop, isFollowEnabled, isAtBottom]);

  // Auto-scroll when new messages arrive and follow is enabled
  useEffect(() => {
    if (isFollowEnabled) {
      scrollToBottom();
    }
  }, [messages, isFollowEnabled, scrollToBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return {
    scrollContainerRef,
    isFollowEnabled,
    setIsFollowEnabled,
    handleScroll,
    scrollToBottom,
    isAtBottom,
  };
}
