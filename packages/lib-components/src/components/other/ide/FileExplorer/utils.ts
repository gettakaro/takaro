import type { SandpackBundlerFiles } from '@codesandbox/sandpack-client';

export const fromPropsToModules = ({
  autoHiddenFiles,
  visibleFiles,
  files,
  prefixedPath,
}: {
  prefixedPath: string;
  files: SandpackBundlerFiles;
  autoHiddenFiles?: boolean;
  visibleFiles: string[];
}): { directories: string[]; modules: string[] } => {
  const hasVisibleFilesOption = visibleFiles.length > 0;

  /**
   * When visibleFiles or activeFile are set, the hidden and active flags on the files prop are ignored.
   * @see: https://sandpack.codesandbox.io/docs/getting-started/custom-content#visiblefiles-and-activefile
   */
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

  const directories = new Set(
    fileListWithoutPrefix
      .filter((file) => file.includes('/'))
      .map((file) => `${prefixedPath}${file.split('/')[0]}/`)
  );

  const modules = fileListWithoutPrefix
    .filter((file) => !file.includes('/'))
    .map((file) => `${prefixedPath}${file}`);

  return { directories: Array.from(directories), modules };
};

// Currently it should be possible to rename files (this includes moving) in case they remain in the same top directory: hooks, cron and command.
export function canRename(current_path: string, new_path: string) {
  // if the toplevels are equal we can show it as a possible drop
  const eq_top_lvl = new RegExp(
    `${current_path.substring(1).split('/')[0]}\/*`
  );
  return eq_top_lvl.test(new_path);
}

// get filename from full path
export function getFileName(path: string) {
  return path.split('/').filter(Boolean).pop()!;
}
