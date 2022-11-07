import { Dispatch, createContext } from 'react';

export interface IModuleContext {
  moduleData: Partial<ModuleData>;
  setModuleData: Dispatch<Partial<ModuleData>>;
}

export interface ModuleData {
  id: string | null;
  fileMap: Record<string, string> | null;
}

export const ModuleContext = createContext<IModuleContext>(undefined!);
