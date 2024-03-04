import { CommandOutputDTO, CronJobOutputDTO, FunctionOutputDTO, HookOutputDTO } from '@takaro/apiclient';
import { FunctionType } from 'hooks/useModule';
import { PropsWithChildren, createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

interface FileActions {
  openFile: (path: string) => void;
  resetFile: (path: string) => void;
  setActiveFile: (path: string) => void;

  updateFile: (path: string, code: string) => void;
  addFile: (path: string, code?: string) => void;
  closeFile: (path: string) => void;
  deleteFile: (path: string) => void;
}

interface File {
  functionId: FunctionOutputDTO['id'];
  type: FunctionType;
  itemId: CommandOutputDTO['id'] | CronJobOutputDTO['id'] | HookOutputDTO['id'];
  code: string;
}

type StudioProps = {
  moduleId: string;
  moduleName: string;
  readOnly: boolean;
  fileMap: Record<string, File>;
};
type StudioActions = FileActions;
type StudioState = StudioProps & StudioActions;

type StudioStore = ReturnType<typeof createStudioStore>;

const createStudioStore = (initProps: StudioProps) => {
  return createStore<StudioState>()((set) => ({
    ...initProps,
    openFile: (path: string) => {},
    resetFile: (path: string) => {},
    setActiveFile: (path: string) => {},
    updateFile: (path: string, code: string) => {},
    addFile: (path: string, code?: string) => {},
    closeFile: (path: string) => {},
    deleteFile: (path: string) => {},
  }));
};

const StudioContext = createContext<StudioStore | null>(null);
type StudioProviderProps = PropsWithChildren<StudioProps>;
export function StudioProvider({ children, ...props }: StudioProviderProps) {
  const storeRef = useRef<StudioStore>();
  if (!storeRef.current) {
    storeRef.current = createStudioStore(props);
  }

  return <StudioContext.Provider value={storeRef.current}>{children}</StudioContext.Provider>;
}

export function useStudioContext<T>(selector: (state: StudioState) => T): T {
  const store = useContext(StudioContext);
  if (!store) throw new Error('StudioStore should be used within a StudioProvider');
  return useStore(store, selector);
}
