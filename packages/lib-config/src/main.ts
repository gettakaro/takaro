import convict, { Path, PathValue, Schema } from 'convict';

export enum EXECUTION_MODE {
  FIRECRACKER = 'firecracker',
  LOCAL = 'local',
  LAMBDA = 'lambda',
}

export interface IBaseConfig {
  app: {
    name: string;
  };
  mode: 'development' | 'production' | 'test';
  functions: {
    executionMode: EXECUTION_MODE;
  };
}

export const baseConfigConvict: Schema<IBaseConfig> = {
  app: {
    name: {
      doc: 'Name of the running package',
      format: String,
      default: 'UNNAMED_PACKAGE',
      env: 'APP_NAME',
    },
  },
  mode: {
    doc: 'The application mode',
    format: ['development', 'production', 'test'],
    default: 'production',
    env: 'NODE_ENV',
  },
  functions: {
    executionMode: {
      doc: 'The mode to use when executing functions. Setting to "local" is VERY INSECURE! Only do it if you know what you are doing',
      format: Object.values(EXECUTION_MODE),
      default: EXECUTION_MODE.FIRECRACKER,
      env: 'FUNCTIONS_EXECUTION_MODE',
    },
  },
};

export class Config<T extends IBaseConfig> {
  public _config: convict.Config<T>;

  constructor(valuesArray: Schema<Partial<T>>[] = []) {
    const values = [...valuesArray, baseConfigConvict].reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});
    this._config = convict<T>(values as Schema<T>);
  }

  // Thanks Diego :)
  // https://twitter.com/diegohaz/status/1309489079378219009
  get<K extends Path<T>>(arg: K): K extends null | undefined ? T : K extends Path<T> ? PathValue<T, K> : never {
    return this._config.get(arg);
  }

  load(data: Partial<T>) {
    this._config.load(data);
  }

  validate() {
    this._config.validate({
      allowed: 'strict',
      output: (str: string) => {
        throw new Error(str);
      },
    });
  }
}
