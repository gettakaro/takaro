export interface TakaroConfigSchema {
  type: 'object';
  properties: {
    [name: string]: any;
  };
  required: string[];
}
