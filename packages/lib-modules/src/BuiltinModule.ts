interface IModuleItem {
  name: string;
  function: string;
}

export abstract class BuiltinModule {
  constructor(public name: string) {}

  public commands: Array<IModuleItem> = [];
  public hooks: Array<IModuleItem> = [];
  public cronJobs: Array<IModuleItem> = [];
}
