import { z } from 'zod';
import { InputType } from './InputTypes';

const baseShape = z.object({
  name: z
    .string()
    .min(4, {
      message: 'Name requires a minimum length of 4 characters',
    })
    .max(25, {
      message: 'Name requires a maximum length of 25 characters',
    })
    .nonempty('Name cannot be empty'),
  description: z
    .string()
    .min(4, {
      message: 'Description requires a minimum length of 4 characters',
    })
    .max(1000, {
      message: 'Description requires a maximum length of 1000 characters',
    })
    .nonempty('Description cannot be empty'),
});

/* based on selected value in select field (with name type)
 a different subschema will be used
*/
export const validationSchema = z.object({
  configFields: z
    .array(
      z

        .discriminatedUnion('type', [
          z.object({
            type: z.literal(InputType.string.valueOf()),
            default: z.string(),
            minLength: z.number().min(1).max(100).optional().nullable(),
            maxLength: z.number().min(2).max(100).optional().nullable(),
            required: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.number.valueOf()),
            default: z.number().min(0),
            minimum: z.number().min(0).optional().nullable(),
            maximum: z.number().min(1).optional().nullable(),
            required: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.enum.valueOf()),
            enum: z.array(z.string()).nonempty(),
            default: z.string().nonempty(),
          }),
          z.object({
            type: z.literal(InputType.boolean.valueOf()),
            default: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.array.valueOf()),
            default: z.array(z.string()),
            required: z.boolean(),
          }),
        ])
        .and(baseShape)
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
      }
    )

    .superRefine((data, ctx) => {
      data.forEach((item) => {
        if (item.type === InputType.string.valueOf()) {
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
