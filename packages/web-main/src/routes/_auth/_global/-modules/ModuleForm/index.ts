import { ModuleVersionOutputDTO, PermissionCreateDTO } from '@takaro/apiclient';
import { z } from 'zod';
import { schemaToInputs } from '../schemaConversion/SchemaToInputs';

export interface ModuleFormSubmitProps {
  name: string;
  description: string;
  author?: string;
  supportedGames?: string[];
  permissions: PermissionCreateDTO[];
  schema: string;
  uiSchema: string;
}

export interface ModuleFormProps {
  isLoading?: boolean;
  onSubmit?: (data: ModuleFormSubmitProps) => void;
  error: string | string[] | null;
  moduleName?: string;
  moduleAuthor?: string;
  moduleSupportedGames?: string[];
  moduleVersion?: ModuleVersionOutputDTO;
}

export const moduleViewValidationSchema = z.object({
  view: z.enum(['manual', 'builder']),
});

export const canRenderInBuilder = (configSchema: string, uiSchema: string) => {
  try {
    const result = schemaToInputs(JSON.parse(configSchema));
    if (result.errors.length > 0) {
      return false;
    }
    JSON.parse(uiSchema);

    return true;
  } catch {
    return false;
  }
};
