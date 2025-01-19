import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { z } from 'zod';
import { IPV4_AND_PORT_REGEX, IPV4_REGEX, FQDN_REGEX } from '@takaro/lib-components';

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
  enabled: z.boolean(),
});

export const validationSchema = baseShape.and(
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Sevendaystodie.valueOf()),
      connectionInfo: z.object({
        host: z.union([
          z
            .string()
            .regex(FQDN_REGEX, 'The provided value is not a valid FQDN')
            .min(1, { message: 'Host cannot be empty' })
            .optional(),
          z
            .string()
            .regex(IPV4_AND_PORT_REGEX, 'The provided value is not of the format ipv4:port')
            .min(1, { message: 'Host cannot not be empty' })
            .optional(),
        ]),
        adminUser: z.string().min(1, { message: 'Admin user cannot be empty' }).optional(),
        adminToken: z.string().min(1, { message: 'Admin token cannot be empty' }).optional(),
        useTls: z.boolean().optional(),
        useCPM: z.boolean().optional(),
        useLegacy: z.boolean().optional(),
      }),
    }),

    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Rust.valueOf()),
      connectionInfo: z.object({
        host: z.union([
          z
            .string()
            .regex(FQDN_REGEX, 'The provided value is not a valid FQDN')
            .min(1, { message: 'Host cannot be empty' })
            .optional(),
          z
            .string()
            .regex(IPV4_REGEX, 'The provided value is not a valid ipv4')
            .min(1, { message: 'Server Ip cannot be empty' })
            .optional(),
        ]),
        rconPort: z.number().nonnegative().min(1).max(65535).optional(),
        rconPassword: z.string().min(1, { message: 'Rcon password cannot be empty' }).optional(),
        useTls: z.boolean(),
      }),
    }),

    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Mock.valueOf()),
      connectionInfo: z.object({
        host: z.string().min(1, { message: 'Host cannot be empty' }).optional(),
        name: z.string().min(1, { message: 'Name cannot be empty' }).optional(),
      }),
    }),

    z.object({
      type: z.literal(GameServerCreateDTOTypeEnum.Generic.valueOf()),
      connectionInfo: z.object({
        code: z.string().min(1, { message: 'Code cannot be empty' }).optional(),
      }),
    }),
  ]),
);
