import { gameServerOptions } from 'queries/gameservers';
import { useEffect } from 'react';
import { useSelectedGameServer } from './useSelectedGameServerContext';
import { useQuery } from '@tanstack/react-query';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    // Store the original document title
    const originalTitle = document.title;

    // Set the new title
    document.title = `${title} - Takaro`;

    // Return the cleanup function to reset to the original title when the component unmounts or if the title prop changes
    return () => {
      document.title = originalTitle;
    };
  }, [title]); // Re-run the effect when the title prop changes
}

// alternative version that adds the currently selected gameServer name to the title
export function useGameServerDocumentTitle(title: string) {
  const { selectedGameServerId } = useSelectedGameServer();
  const { data: gameServer, isLoading } = useQuery(gameServerOptions(selectedGameServerId));

  if (selectedGameServerId === null) {
    throw new Error('useGameServerDocumentTitle must be used within a GameServerRoute');
  }

  useEffect(() => {
    if (isLoading) {
      const originalTitle = document.title;
      document.title = `${title} - Takaro`;
      return () => {
        document.title = originalTitle;
      };
    }
    if (gameServer) {
      const originalTitle = document.title;
      document.title = `${title} ${gameServer.name} - Takaro`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [title, isLoading]);
}
