import { config } from '../../config';

export enum CoordinatorModes {
  SIMPLE,
  CLUSTER,
}

export const modeMapper: Record<string, CoordinatorModes> = {
  simple: CoordinatorModes.SIMPLE,
  cluster: CoordinatorModes.CLUSTER,
};

export abstract class Coordinator {
  public mode: CoordinatorModes;

  constructor() {
    this.mode = config.coordinator.mode;
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
}
