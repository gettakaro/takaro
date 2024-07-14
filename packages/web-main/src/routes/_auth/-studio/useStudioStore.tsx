import { CommandOutputDTO, CronJobOutputDTO, FunctionOutputDTO, HookOutputDTO } from '@takaro/apiclient';
import { PropsWithChildren, createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

interface FileActions {
  openFile: (path: string) => void;
  resetFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;

  updateFile: (path: string, code: string) => void;
  addFile: (file: FileWithPath) => void;
  closeFile: (path: string) => void;
  deleteFile: (path: string) => void;
}

export enum FileType {
  Commands = 'commands',
  Hooks = 'hooks',
  CronJobs = 'cronjobs',
  Functions = 'functions',
}

export type FileMap = Record<string, File>;

interface File {
  functionId: FunctionOutputDTO['id'];
  type: FileType;
  itemId: CommandOutputDTO['id'] | CronJobOutputDTO['id'] | HookOutputDTO['id'];
  code: string;
  hidden?: boolean;
}

// code is optional here
type FileWithPath = Omit<File, 'code'> & { path: string; code?: string };

export type StudioProps = {
  moduleId: string;
  moduleName: string;
  readOnly: boolean;
  fileMap: FileMap;
  /// File that is currently active in the editor
  activeFile?: string;
  /// List of files that are visible in the editor (tabs)
  visibleFiles: string[];
};
type StudioActions = FileActions;
type StudioState = StudioProps & StudioActions;
type StudioStore = ReturnType<typeof createStudioStore>;

const createStudioStore = (initProps: StudioProps) => {
  return createStore<StudioState>()((set) => ({
    ...initProps,

    openFile: (path: string): void => {
      set((state) => ({
        activeFile: path,
        visibleFiles: state.visibleFiles.includes(path) ? state.visibleFiles : [...state.visibleFiles, path],
      }));
    },

    resetFile: (path: string): void => {
      set((state) => {
        const file = state.fileMap[path];
        if (!file) return state;

        return {
          fileMap: {
            ...state.fileMap,
            [path]: {
              ...file,
              code: '',
            },
          },
        };
      });
    },

    renameFile: (oldPath: string, newPath: string): void => {
      set((state) => {
        const file = state.fileMap[oldPath];
        if (!file) return state;

        const newFileMap = { ...state.fileMap };
        delete newFileMap[oldPath];
        newFileMap[newPath] = file;

        return {
          fileMap: newFileMap,
          visibleFiles: state.visibleFiles.map((file) => (file === oldPath ? newPath : file)),
          activeFile: state.activeFile === oldPath ? newPath : state.activeFile,
        };
      });
    },

    setActiveFile: (path: string): void => set({ activeFile: path }),
    updateFile: (path: string, code: string) => {
      set((state) => {
        const file = state.fileMap[path];
        if (!file) return state;

        return {
          fileMap: {
            ...state.fileMap,
            [path]: {
              ...file,
              code,
            },
          },
        };
      });
    },

    addFile: (f: FileWithPath) => {
      set((state) => {
        const file = state.fileMap[f.path];
        if (file) return state;

        return {
          activeFile: f.path,
          visibleFiles: [...state.visibleFiles, f.path],
          fileMap: {
            ...state.fileMap,
            [f.path]: {
              functionId: f.functionId,
              type: f.type,
              itemId: f.itemId,
              code: f.code || '',
            },
          },
        };
      });
    },
    closeFile: (path: string) => {
      set((state) => {
        const newVisibleFiles = state.visibleFiles.filter((file) => file !== path);
        return {
          visibleFiles: newVisibleFiles,
          activeFile: newVisibleFiles[newVisibleFiles.length - 1] ?? undefined,
        };
      });
    },

    deleteFile: (path: string) => {
      set((state) => {
        const newFileMap = { ...state.fileMap };
        delete newFileMap[path];
        return { fileMap: newFileMap };
      });
    },
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
