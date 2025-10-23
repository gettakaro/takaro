import { useEffect } from 'react';
import { GameServerOutputDTO } from '@takaro/apiclient';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} - Takaro`;
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}

// alternative version that adds the currently selected gameServer name to the title
export function useGameServerDocumentTitle(title: string, gameServer: GameServerOutputDTO) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} ${gameServer.name} - Takaro`;
    return () => {
      document.title = originalTitle;
    };
  }, [title, gameServer.name]);
}
