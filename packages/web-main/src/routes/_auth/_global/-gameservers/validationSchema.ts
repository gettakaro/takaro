import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { z } from 'zod';
import { IPV4_AND_PORT_REGEX, IPV4_REGEX } from '@takaro/lib-components';

export type IFormInputs = z.infer<typeof validationSchema>;

// NOTE: due to a limitation in react-hook-form, unions are not fully supported.
// Only if the custom fields are optional, the validation will work.
const baseShape = z.object({
  name: z
    .string()
    .min(4, {
      message: 'Server name requires a minimum length of 4 characters',
    })
    .max(21)
    .min(1, { message: 'Server name cannot be empty' }),
});

export const validationSchema = baseShape.and(
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Sevendaystodie.valueOf()),
      connectionInfo: z.object({
        host: z
          .string()
          .regex(IPV4_AND_PORT_REGEX, 'The provided value is not of the format ipv4:port')
          .min(1, { message: 'Host cannot not be empty' })
          .optional(),
        adminUser: z.string().min(1, { message: 'Admin user cannot be empty' }).optional(),
        adminToken: z.string().min(1, { message: 'Admin token cannot be empty' }).optional(),
        useTls: z.boolean().optional(),
        useCPM: z.boolean().optional(),
      }),
    }),

    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Rust.valueOf()),
      connectionInfo: z.object({
        host: z
          .string()
          .regex(IPV4_REGEX, 'The provided value is not a valid ipv4')
          .min(1, { message: 'Server Ip cannot be empty' })
          .optional(),
        rconPort: z.number().nonnegative().min(1).max(65535).optional(),
        rconPassword: z.string().min(1, { message: 'Rcon password cannot be empty' }).optional(),
        useTls: z.boolean(),
      }),
    }),

    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Mock.valueOf()),
      connectionInfo: z.object({
        host: z.string().min(1, { message: 'Host cannot be empty' }).optional(),
        eventInterval: z.number().min(500).optional(),
        playerPoolSize: z.number().max(200).nonnegative('Player pool size cannot be negative').optional(),
      }),
    }),
  ])
);
