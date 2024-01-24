import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { logger } from '@takaro/util';
import { config } from '../config.js';
import { Agent } from 'http';

class InfluxDbHelperClass {
  private log = logger('influxdb');

  private client: InfluxDB;
  private agent: Agent;

  private cachedQueryClient: QueryApi;
  private cachedWriteClients = new Map<string, WriteApi>();

  constructor() {
    this.log.debug('Creating HTTP keepalive agent');
    this.agent = new Agent({
      keepAlive: true,
      keepAliveMsecs: 20000, // 20 seconds
    });

    this.log.debug('Creating new InfluxDB client');
    this.client = new InfluxDB({
      url: `http://${config.get('influxdb.host')}:${config.get('influxdb.port')}`,
      token: config.get('influxdb.token'),
      transportOptions: {
        agent: this.agent,
      },
    });
  }

  /**
   * Get a Influxdb WriteApi for the given bucket.
   * @param bucketId the bucket to write to
   * @param domainId used as a default tag
   * @returns
   */
  getWriteClient(bucketId: string): WriteApi {
    const cachedClient = this.cachedWriteClients.get(bucketId);
    if (cachedClient) return cachedClient;

    const client = this.client.getWriteApi(config.get('influxdb.org'), bucketId, 'ms', {
      writeFailed: (error, lines) => {
        this.log.error(`Failed to write ${lines.length} lines to InfluxDB: ${error}`);
      },
    });
    this.cachedWriteClients.set(bucketId, client);
    return client;
  }

  /**
   * Get a Influxdb QueryApi
   * @returns
   */
  getQueryClient(): QueryApi {
    if (this.cachedQueryClient) {
      return this.cachedQueryClient;
    }

    // use flux query language for queries
    this.cachedQueryClient = this.client.getQueryApi({ org: config.get('influxdb.org'), type: 'flux' });
    return this.cachedQueryClient;
  }

  async destroy(): Promise<void> {
    this.log.debug('Close Writeapis: flush unwritten points, cancel scheduled retries');
    for (const [bucketId, writeClient] of this.cachedWriteClients.entries()) {
      this.log.debug(`Closing Influxdb WriteApi for ${bucketId}`);
      await writeClient.close();
    }
    this.agent.destroy();
  }
}

export const InfluxDbHelper = new InfluxDbHelperClass();
