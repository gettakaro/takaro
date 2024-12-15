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

export type ModuleBuilderProps = {
  moduleId: string;
  versionId: string;
  moduleName: string;
  readOnly: boolean;
  fileMap: FileMap;
  /// File that is currently active in the editor
  activeFile?: string;
  /// List of files that are visible in the editor (tabs)
  visibleFiles: string[];
};
type ModuleBuilderActions = FileActions;
type ModuleBuilderState = ModuleBuilderProps & ModuleBuilderActions;
type ModuleBuilderStore = ReturnType<typeof createModuleBuilderStore>;

const createModuleBuilderStore = (initProps: ModuleBuilderProps) => {
  return createStore<ModuleBuilderState>()((set) => ({
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

const ModuleBuilderContext = createContext<ModuleBuilderStore | null>(null);
type ModuleBuilderProviderProps = PropsWithChildren<ModuleBuilderProps>;
export function ModuleBuilderProvider({ children, ...props }: ModuleBuilderProviderProps) {
  const storeRef = useRef<ModuleBuilderStore>();
  if (!storeRef.current) {
    storeRef.current = createModuleBuilderStore(props);
  }

  return <ModuleBuilderContext.Provider value={storeRef.current}>{children}</ModuleBuilderContext.Provider>;
}

export function useModuleBuilderContext<T>(selector: (state: ModuleBuilderState) => T): T {
  const store = useContext(ModuleBuilderContext);
  if (!store) throw new Error('ModuleBuilder should be used within a ModuleBuilderProvider');
  return useStore(store, selector);
}
