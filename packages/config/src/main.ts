import convict, { Path, PathValue, Schema } from 'convict';

export interface IBaseConfig {
  http: {
    port: number;
  };
}

const baseConfigConvict: Schema<IBaseConfig> = {
  http: {
    port: {
      doc: 'The port to bind.',
      format: (value) => {
        if (process.env.NODE_ENV === 'test') {
          return value;
        }
        value = parseInt(value, 10);

        // Check if the value is between 0 - 65535
        if (value < 0 || value > 65535) {
          throw new Error('ports must be within range 0 - 65535');
        }
      },
      default: 3000,
      env: 'PORT',
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
  get<K extends Path<T>>(
    arg: K
  ): K extends null | undefined
    ? T
    : K extends Path<T>
    ? PathValue<T, K>
    : never {
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
