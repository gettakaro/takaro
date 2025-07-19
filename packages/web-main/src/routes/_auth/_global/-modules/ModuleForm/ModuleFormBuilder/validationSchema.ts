import { z } from 'zod';
import { InputType } from '../../schemaConversion/inputTypes';
import {
  moduleDescriptionShape,
  moduleNameShape,
  modulePermissionShape,
} from '../../../../../../util/validationShapes';

// NOTE: nested discriminated unions are not supported by zod
// https://github.com/colinhacks/zod/issues/1618
// https://github.com/colinhacks/zod/issues/2106#issuecomment-1836566278
// based on selected value in select field (with name type)

const baseConfigFieldShape = z.object({
  name: z
    .string()
    .min(4, {
      message: 'Name requires a minimum length of 4 characters',
    })
    .max(25, {
      message: 'Name requires a maximum length of 25 characters',
    })
    .min(1, { message: 'Name cannot be empty' }),
  description: z.string().max(1000, {
    message: 'Description requires a maximum length of 1000 characters',
  }),
});

export const validationSchema = z.object({
  name: moduleNameShape,
  description: moduleDescriptionShape,
  author: z.string().optional(),
  supportedGames: z.array(z.enum(['all', 'other', 'minecraft', '7 days to die', 'rust'])).optional(),
  permissions: z.array(modulePermissionShape),
  configFields: z
    .array(
      z
        .discriminatedUnion('type', [
          z.object({
            type: z.literal(InputType.text.valueOf()),
            default: z.string().optional(),
            minLength: z.number().min(1).max(100).optional(),
            maxLength: z.number().min(1).max(100).optional(),
            required: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.boolean.valueOf()),
            default: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.number.valueOf()),
            default: z.number().min(0).optional(),
            minimum: z.number().min(0).optional(),
            maximum: z.number().min(1).optional(),
            required: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.enumeration.valueOf()),
            values: z.array(z.string()).nonempty(),
            default: z.union([z.string().min(1, { message: 'default is required' }), z.array(z.string())]).optional(),
            multiple: z.boolean(),
            required: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.array.valueOf()),
            default: z.array(z.string()).optional(),
            required: z.boolean(),
            minItems: z.number().min(1).optional(),
            maxItems: z.number().min(1).optional(),
            uniqueItems: z.boolean().optional(),
          }),
          z.object({
            type: z.literal(InputType.duration.valueOf()),
            default: z.number().positive().optional(),
            required: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.item.valueOf()),
            multiple: z.boolean(),
            required: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.country.valueOf()),
            multiple: z.boolean(),
            default: z.union([z.string(), z.array(z.string())]).optional(),
            // there is no validation on `default` key of country, because default is not a required field and since it is a select field, users cannot enter invalid values
            required: z.boolean(),
          }),
        ])
        .and(baseConfigFieldShape),
    )

    .refine(
      (data) => {
        const names = data.map((item) => item.name);
        return new Set(names).size === names.length;
      },
      {
        message: 'Each configField should have a unique name',
        path: ['0', 'name'],
        params: {
          ref: { name: 'name' },
        },
      },
    )

    .superRefine((data, ctx) => {
      data.forEach((item) => {
        if (item.type === InputType.text.valueOf()) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (item.minLength >= item.maxLength) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Min should be less than Max',
            });
          }
        }

        if (item.type === InputType.number.valueOf()) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (item.minimum >= item.maximum) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Min should be less than Max',
            });
          }
        }
      });
    }),
});
