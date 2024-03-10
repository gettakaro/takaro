import { StudioProps } from '../useStudioStore';

export const fromPropsToModules = ({
  autoHiddenFiles,
  visibleFiles,
  files,
  prefixedPath,
  depth,
}: {
  prefixedPath: string;
  files: StudioProps['fileMap'];
  autoHiddenFiles?: boolean;
  visibleFiles: string[];
  depth: number;
}): { directories: string[]; modules: string[] } => {
  const hasVisibleFilesOption = visibleFiles.length > 0;

  const filterByHiddenProperty = autoHiddenFiles && !hasVisibleFilesOption;
  const filterByVisibleFilesOption = autoHiddenFiles && !!hasVisibleFilesOption;

  const fileListWithoutPrefix = Object.keys(files)
    .filter((filePath) => {
      const isValidatedPath = filePath.startsWith(prefixedPath);
      if (filterByVisibleFilesOption) {
        return isValidatedPath && visibleFiles.includes(filePath);
      }

      if (filterByHiddenProperty) {
        return isValidatedPath && !files[filePath]?.hidden;
      }

      return isValidatedPath;
    })
    .map((file) => file.substring(prefixedPath.length));

  const modules = fileListWithoutPrefix
    .filter((file) => !file.includes('/'))
    .filter((file) => !file.endsWith('package.json'))
    .map((file) => `${prefixedPath}${file}`);

  return {
    directories: depth === 0 ? ['/hooks/', '/cronjobs/', '/commands/', '/functions/'] : [],
    modules,
  };
};

// Currently it should be possible to rename files (this includes moving) in case they remain in the same top directory: hooks, cron and command.
export function getNewPath(path: string, newFileName: string) {
  const pathParts = path.split('/');
  pathParts[pathParts.length - 1] = newFileName;
  return pathParts.join('/');
}

// get filename from full path
export function getFileName(path: string): string {
  return path.split('/').filter(Boolean).pop()!;
}
