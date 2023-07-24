export const calculateNearestUniquePath = (currentPath: string, otherPaths: string[]): string => {
  const currentPathParts = (currentPath[0] === '/' ? currentPath.slice(1) : currentPath).split('/');
  const resultPathParts: string[] = [];

  // If path is on root, there are no parts to loop through
  if (currentPathParts.length === 1) {
    resultPathParts.unshift(currentPathParts[0]);
  } else {
    // Loop over all other paths to find a unique path
    for (let fileIndex = 0; fileIndex < otherPaths.length; fileIndex++) {
      // We go over each part of the path from end to start to find the closest unique directory
      const otherPathParts = otherPaths[fileIndex].split('/');
      for (let partsFromEnd = 1; partsFromEnd <= currentPathParts.length; partsFromEnd++) {
        const currentPathPart = currentPathParts[currentPathParts.length - partsFromEnd];
        const otherPathPart = otherPathParts[otherPathParts.length - partsFromEnd];

        // If this part hasn't been added to the result path, we add it here
        if (resultPathParts.length < partsFromEnd) {
          resultPathParts.unshift(currentPathPart);
        }

        // If this part is different between the current path and other path we break
        // as from this moment the current path is unique compared to this other path
        if (currentPathPart !== otherPathPart) {
          break;
        }
      }
    }
  }

  // Add `..` if this is a relative path
  if (resultPathParts.length < currentPathParts.length) {
    resultPathParts.unshift('..');
  }

  // Join the result path parts into a path string
  return resultPathParts.join('/');
};

export const getFileName = (filePath: string): string => {
  const lastIndexOfSlash = filePath.lastIndexOf('/');
  return filePath.slice(lastIndexOfSlash + 1);
};
