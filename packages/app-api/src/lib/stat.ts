import { InfluxDbHelper } from './influxDbHelper.js';
import { Point, flux, fluxString, fluxDateTime, ParameterizedQuery } from '@influxdata/influxdb-client';
import { config } from '../config.js';
import { logger } from '@takaro/util';
import { DateTime } from 'luxon';

interface BaseStatReadOpts {
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
    this.writer = InfluxDbHelper.getWriteClient(config.get('influxdb.bucket'));
    this.bucket = config.get('influxdb.bucket');
    this.writer.useDefaultTags({ domainId: domainId });
    this.reader = InfluxDbHelper.getQueryClient();
  }

  /**
   * Write a point to the database
   * Note: influxDB asynchroniously writes batches of points to the database (by default 5000 points).
   */
  abstract write(...args: unknown[]): void;
  abstract read(opts: BaseStatReadOpts): Promise<BaseStatReadResult<unknown>[]>;

  protected buildQuery(
    query: ParameterizedQuery,
    opts: BaseStatReadOpts & { measurement: string }
  ): ParameterizedQuery {
    this.logger.debug(`querying ${opts.measurement}`);
    const base = flux`from(bucket: ${fluxString(this.bucket)})
      |> range(start: ${fluxDateTime(opts.timeRangeStart)}, stop: ${fluxDateTime(opts.timeRangeEnd)})
      |> filter(fn: (r) => r._measurement == ${fluxString(this.measurement)} and r.domainId == ${fluxString(
      this.domainId
    )})`;
    const q = flux`${base} ${query}`; // I guess not all queries will have an aggregation (e.g. players from certain countries) ${this.getDynAggregationWindow({ timeRangeEnd: opts.timeRangeEnd, timeRangeStart: opts.timeRangeStart })})}
    this.logger.verbose(q);
    return q;
  }

  private getDynAggregationWindow(opts: BaseStatReadOpts): ParameterizedQuery {
    const start = DateTime.fromISO(opts.timeRangeStart);
    const end = DateTime.fromISO(opts.timeRangeEnd);
    const diff = start.diff(end).toObject(); // { days: 1, hours: 2, minutes: 3, ... }
    let period = '';

    if (diff.years) {
      period = '1mo';
    } else if (diff.quarters) {
      period = '15d';
    } else if (diff.months) {
      period = '1d';
    } else if (diff.weeks) {
      period = '6h';
    } else if (diff.days) {
      period = '1h';
    } else if (diff.hours) {
      period = '5m';
    } else if (diff.minutes) {
      period = '5s';
    }

    return flux`|> aggregateWindow(
                      every: ${period}, 
                      fn: mean, 
                      createEmpty: false
                )`;
  }
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

  public write(opts: PlayerPingStatWriteOpts) {
    const point = new Point(this.measurement)
      .tag('playerId', opts.playerId)
      .tag('gameServerId', opts.gameServerId)
      .intField('ping', opts.ping)
      .timestamp(DateTime.now().toSeconds());
    this.writer.writePoint(point);
  }

  public async read(opts: PlayerPingStatReadOpts): Promise<PlayerPingStatOutput[]> {
    const subQ = flux`
      |> filter(fn: (r) => r.playerId = ${fluxString(opts.playerId)} and r.gameServerId == ${fluxString(
      opts.gameServerId
    )})
      |> keep(columns: ["_time", "_value"])
    `;

    const query = this.buildQuery(subQ, {
      measurement: this.measurement,
      timeRangeEnd: opts.timeRangeEnd,
      timeRangeStart: opts.timeRangeStart,
    });
    return await this.reader.collectRows<PlayerPingStatOutput>(query, (row, tableMeta) => ({
      timestamp: row[tableMeta.column('_time').index],
      data: { ping: Number.parseInt(row[tableMeta.column('_value').index]) },
    }));
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

  public write(opts: PlayerLocationWriteOpts) {
    const point = new Point(this.measurement)
      .tag('playerId', opts.playerId)
      .tag('gameServerId', opts.gameServerId)
      .floatField('locationX', opts.location.x)
      .floatField('locationY', opts.location.y)
      .floatField('locationZ', opts.location.z)
      .timestamp(DateTime.now().toSeconds());
    this.writer.writePoint(point);
  }

  public async read(opts: PlayerPingStatReadOpts): Promise<PlayerLocationStatOutput[]> {
    const subQ = flux`
      |> filter(fn: (r) => r.playerId == ${fluxString(opts.playerId)} and r.gameServerId == ${fluxString(
      opts.gameServerId
    )})
      |> keep(columns: ["_time", "_value"])
    `;
    const query = this.buildQuery(subQ, {
      measurement: this.measurement,
      timeRangeEnd: opts.timeRangeEnd,
      timeRangeStart: opts.timeRangeStart,
    });

    return await this.reader.collectRows<PlayerLocationStatOutput>(query, (row, tableMeta) => ({
      timestamp: row[tableMeta.column('_time').index],
      data: {
        location: {
          x: Number.parseFloat(row[tableMeta.column('locationX').index]),
          y: Number.parseFloat(row[tableMeta.column('locationY').index]),
          z: Number.parseFloat(row[tableMeta.column('locationZ').index]),
        },
      },
    }));
  }
}
