import { useStudioContext } from './useStudioStore';

export const useActiveCode = (): {
  code: string;
  readOnly: boolean;
  updateCode: (newcode: string) => void;
} => {
  const activeFile = useStudioContext((s) => s.activeFile);
  const fileMap = useStudioContext((s) => s.fileMap);
  const updateFile = useStudioContext((s) => s.updateFile);

  if (!activeFile) {
    throw new Error('This hook must be used within the context of a nonNullable active file');
  }

  return {
    readOnly: false,
    code: fileMap[activeFile].code,
    updateCode: (newCode) => updateFile(activeFile, newCode),
  };
};
