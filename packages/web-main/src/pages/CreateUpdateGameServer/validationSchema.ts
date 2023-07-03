import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { z } from 'zod';
import { IPV4_AND_PORT_REGEX, IPV4_REGEX } from '@takaro/lib-components';

const baseShape = z.object({
  name: z
    .string()
    .min(4, {
      message: 'Server name requires a minimum length of 4 characters',
    })
    .max(25, {
      message: 'Server name requires a maximum length of 25 characters',
    })
    .nonempty('Server name cannot be empty'),
});

export const validationSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Sevendaystodie.valueOf()),
      connectionInfo: z.object({
        host: z
          .string()
          .regex(IPV4_AND_PORT_REGEX, 'The provided value is not of the format ipv4:port')
          .nonempty('Host cannot not be empty'),
        adminUser: z.string().nonempty('Admin user cannot be empty'),
        adminToken: z.string().nonempty('Admin token cannot be empty'),
        useTls: z.boolean(),
      }),
    }),

    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Rust.valueOf()),
      connectionInfo: z.object({
        host: z
          .string()
          .regex(IPV4_REGEX, 'The provided value is not a valid ipv4')
          .nonempty('Server Ip cannot be empty'),
        rconPort: z.number().nonnegative().min(1).max(65535),
        rconPassword: z.string().nonempty('Rcon password cannot be empty'),
        useTls: z.boolean(),
      }),
    }),

    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Mock.valueOf()),
      connectionInfo: z.object({
        host: z.string().nonempty('Host cannot be empty'),
        eventInterval: z.number().min(500),
        playerPoolSize: z.number().max(200).nonnegative('Player pool size cannot be negative'),
      }),
    }),
  ])
  .and(baseShape);
