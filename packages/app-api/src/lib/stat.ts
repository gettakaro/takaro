import { InfluxDbHelper } from './influxDbHelper.js';
import { Point, flux, fluxString, fluxDateTime } from '@influxdata/influxdb-client';
import { config } from '../config.js';
import { logger } from '@takaro/util';

interface BaseStatReadOpts {
  // TODO: rename to timeRangestart and timeRangeEnd
  timeRangeStart: string;
  timeRangeEnd: string;
}

interface BaseStatReadResult<T> {
  timestamp: string;
  data: T;
}

abstract class BaseStat {
  protected writer;
  protected reader;
  protected bucket: string;
  protected logger;
  protected domainId: string;

  constructor(public measurement: string, domainId: string) {
    this.logger = logger(`stat:${measurement}`);
    this.domainId = domainId;
    // using the domainId we could look at the customer's tier and decide which bucket to write to
    this.writer = InfluxDbHelper.getWriteClient(config.get('influxdb.bucket'));
    this.bucket = config.get('influxdb.bucket');
    this.writer.useDefaultTags({ domainId: domainId });
    this.reader = InfluxDbHelper.getQueryClient();
  }

  abstract write(...args: unknown[]): void;
  abstract read(opts: BaseStatReadOpts): Promise<BaseStatReadResult<unknown>[]>;
}

interface PlayerPingStatReadOpts extends BaseStatReadOpts {
  playerId: string;
  gameServerId: string;
}

export type PlayerPingStatOutput = BaseStatReadResult<{ ping: number }>;

interface PlayerPingStatWriteOpts {
  playerId: string;
  gameServerId: string;
  ping: number;
}

export class PlayerPingStat extends BaseStat {
  constructor(domainId: string) {
    super('player-ping', domainId);
  }

  public async write(opts: PlayerPingStatWriteOpts) {
    const point = new Point(this.measurement)
      .tag('playerId', opts.playerId)
      .tag('gameServerId', opts.gameServerId)
      .intField('ping', opts.ping)
      .timestamp(Date.now());
    this.writer.writePoint(point);
    await this.writer.flush();
  }

  public async read(opts: PlayerPingStatReadOpts): Promise<PlayerPingStatOutput[]> {
    this.logger.debug('reading player point pings', opts);

    // TODO: Depending on the start and end time, we should use a different aggregation function
    const query = flux`from(bucket: ${fluxString(this.bucket)})
        |> range(start: ${fluxDateTime(opts.timeRangeStart)}, stop: ${fluxDateTime(opts.timeRangeEnd)})
        |> filter(fn: (r) => r._measurement == ${fluxString(this.measurement)} and r.playerId == ${fluxString(
      opts.playerId
    )} and r.gameServerId == ${fluxString(opts.gameServerId)} and r.domainId == ${fluxString(this.domainId)})
        |> keep(columns: ["_time", "_value"])
        |> aggregateWindow(every: 10m, fn: mean, createEmpty: false)
      `;

    this.logger.debug('query', query.toString());

    const data = await this.reader.collectRows<PlayerPingStatOutput>(query, (row, tableMeta) => ({
      timestamp: row[tableMeta.column('_time').index],
      data: { ping: Number.parseInt(row[tableMeta.column('_value').index]) },
    }));

    return data;
  }
}

interface Location {
  x: number;
  y: number;
  z: number;
}

interface PlayerLocationWriteOpts {
  playerId: string;
  gameServerId: string;
  location: Location;
}

export type PlayerLocationStatOutput = BaseStatReadResult<{ location: Location }>;

export class PlayerLocationStat extends BaseStat {
  constructor(domainId: string) {
    super('player-location', domainId);
  }

  public async write(opts: PlayerLocationWriteOpts) {
    this.logger.debug(
      `writing point for ${this.measurement} for player ${opts.playerId} on game server ${opts.gameServerId} with location ${opts.location}`
    );
    const point = new Point(this.measurement)
      .tag('playerId', opts.playerId)
      .tag('gameServerId', opts.gameServerId)
      .floatField('locationX', opts.location.x)
      .floatField('locationY', opts.location.y)
      .floatField('locationY', opts.location.z)
      .timestamp(Date.now());
    this.writer.writePoint(point);
    await this.writer.flush();
  }

  public async read(opts: PlayerPingStatReadOpts): Promise<PlayerLocationStatOutput[]> {
    this.logger.debug('reading player point pings', opts);

    const query = flux`from(bucket: ${fluxString(this.bucket)})
        |> range(start: ${fluxDateTime(opts.timeRangeStart)}, stop: ${fluxDateTime(opts.timeRangeEnd)})
        |> filter(fn: (r) => r._measurement == ${fluxString(this.measurement)} and r.playerId == ${fluxString(
      opts.playerId
    )} and r.gameServerId == ${fluxString(opts.gameServerId)} and r.domainId == ${fluxString(this.domainId)})
        |> keep(columns: ["_time", "_value"])
        |> aggregateWindow(every: 10m, fn: mean, createEmpty: false)
      `;

    this.logger.debug('query', query.toString());

    const data = await this.reader.collectRows<PlayerLocationStatOutput>(query, (row, tableMeta) => ({
      timestamp: row[tableMeta.column('_time').index],
      data: {
        location: {
          x: Number.parseFloat(row[tableMeta.column('x').index]),
          y: Number.parseFloat(row[tableMeta.column('y').index]),
          z: Number.parseFloat(row[tableMeta.column('z').index]),
        },
      },
    }));

    return data;
  }
}

export class InventoryStat extends BaseStat {
  constructor(domainId: string) {
    super('player-inventory', domainId);
  }

  public async write(opts: PlayerLocationWriteOpts) {
    this.logger.debug(
      `writing point for ${this.measurement} for player ${opts.playerId} on game server ${opts.gameServerId} with location ${opts.location}`
    );
    const point = new Point(this.measurement)
      .tag('playerId', opts.playerId)
      .tag('gameServerId', opts.gameServerId)
      .stringField('inventory', JSON.stringify(opts.location))
      .timestamp(Date.now());
    this.writer.writePoint(point);
    await this.writer.flush();
  }

  public async read(opts: PlayerPingStatReadOpts): Promise<PlayerLocationStatOutput[]> {
    this.logger.debug('reading player point pings', opts);

    const query = flux`from(bucket: ${fluxString(this.bucket)})
        |> range(start: ${fluxDateTime(opts.timeRangeStart)}, stop: ${fluxDateTime(opts.timeRangeEnd)})
        |> filter(fn: (r) => r._measurement == ${fluxString(this.measurement)} and r.playerId == ${fluxString(
      opts.playerId
    )} and r.gameServerId == ${fluxString(opts.gameServerId)} and r.domainId == ${fluxString(this.domainId)})
        |> keep(columns: ["_time", "_value"])
        |> aggregateWindow(every: 10m, fn: mean, createEmpty: false)
      `;

    this.logger.debug('query', query.toString());

    const data = await this.reader.collectRows<PlayerLocationStatOutput>(query, (row, tableMeta) => ({
      timestamp: row[tableMeta.column('_time').index],
      data: {
        location: {
          x: Number.parseFloat(row[tableMeta.column('x').index]),
          y: Number.parseFloat(row[tableMeta.column('y').index]),
          z: Number.parseFloat(row[tableMeta.column('z').index]),
        },
      },
    }));

    return data;
  }
}
