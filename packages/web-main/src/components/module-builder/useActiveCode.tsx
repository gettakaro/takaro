import { useModuleBuilderContext } from './useModuleBuilderStore';

export const useActiveCode = (): {
  code: string;
  readOnly: boolean;
  updateCode: (newcode: string) => void;
} => {
  const activeFile = useModuleBuilderContext((s) => s.activeFile);
  const fileMap = useModuleBuilderContext((s) => s.fileMap);
  const updateFile = useModuleBuilderContext((s) => s.updateFile);

  if (!activeFile) {
    throw new Error('This hook must be used within the context of a nonNullable active file');
  }

  return {
    readOnly: false,
    code: fileMap[activeFile].code,
    updateCode: (newCode) => updateFile(activeFile, newCode),
  };
};
