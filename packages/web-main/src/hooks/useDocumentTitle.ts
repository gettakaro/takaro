import { useEffect } from 'react';

export function useDocumentTitle(title) {
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
