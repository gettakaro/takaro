import { logger } from '@takaro/util';
import { spawn } from 'node:child_process';
import { config } from '../../config';

interface IRunContainerOptions {
  image: string;
}
export class ContainerdService {
  private log = logger('containerd');
  private namespace = config.get('containerd.namespace');

  async listImages() {
    return this.execute('image', ['list', '--format=json']);
  }

  async pullImage(image: string) {
    return this.execute('image', ['pull', image]);
  }

  async runContainer(opts: IRunContainerOptions) {
    return this.execute('run', [opts.image]);
  }

  private async execute(command: string, params: string[]) {
    return new Promise((resolve, reject) => {
      this.log.info(
        `Executing command "nerdctl ${[command, ...params].join(' ')}"`,
        {
          command,
          params,
        }
      );
      const cmd = spawn(
        config.get('containerd.executablePath'),
        [command, ...params],
        {
          detached: true, // Keep this command running when parent crashes.
          env: {
            ...process.env,
            CONTAINERD_NAMESPACE: this.namespace,
          },
        }
      );

      const output: Array<string> = [];

      cmd.stdout.on('data', (data) => {
        output.push(data);
      });
      cmd.stderr.on('data', (data) => {
        output.push(data);
      });

      cmd.on('exit', (code, signal) => {
        let parsed = output.map((_) => _.toString()).join('');

        if (!parsed.length) {
          throw Error('No output from command');
        }

        try {
          parsed = JSON.parse(parsed);
        } catch (error) {
          // No need to do anything
        }

        this.log.debug(
          `nerdctl command "nerdctl ${[command, ...params].join(
            ' '
          )}" exited with code ${code} and signal ${signal}`,
          { code, signal, output: parsed }
        );
        if (code === 0) {
          this.log.info('Command success', { code, signal });
          resolve(parsed);
        } else {
          this.log.error('Command failed', { code, signal });
          reject(new Error(output.join('')));
        }
      });
    });
  }
}
