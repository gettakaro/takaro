import child_process, { ChildProcess } from 'child_process';
import fs from 'fs';

interface FcOptions {
  binPath: string;
  socketPath: string;
}

export default class Firecracker {
  child: ChildProcess | undefined;
  options: FcOptions;

  constructor(options: FcOptions) {
    this.options = options;

    this.spawn();
    this.setupListeners();
  }

  spawn(binPath = '/usr/bin/firecracker'): void {
    this.child = child_process.spawn(
      binPath,
      ['--api-sock', this.options.socketPath],
      { detached: true }
    );
  }

  setupListeners(): void {
    if (this.child !== undefined) {
      this.child.on('exit', () => {
        fs.unlink(this.options.socketPath, () => {});
        this.child = undefined;
      });

      this.child.on('close', () => {
        fs.unlink(this.options.socketPath, () => {});
        this.child = undefined;
      });

      this.child.on('error', () => {
        fs.unlink(this.options.socketPath, () => {});
      });
    }
  }

  kill(): boolean {
    const isKilled = this.child?.kill() ?? false;

    if (isKilled) {
      fs.unlink(this.options.socketPath, () => {});
      this.child = undefined;
    }

    return isKilled;
  }
}
