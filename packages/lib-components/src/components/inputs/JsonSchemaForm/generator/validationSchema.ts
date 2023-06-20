import { z } from 'zod';
import { InputType } from './InputTypes';

const baseShape = z.object({
  title: z
    .string()
    .min(4, {
      message: 'Title requires a minimum length of 4 characters',
    })
    .max(25, {
      message: 'Title requires a maximum length of 25 characters',
    })
    .nonempty('Title cannot be empty'),
  description: z
    .string()
    .min(4, {
      message: 'Title requires a minimum length of 4 characters',
    })
    .max(1000, {
      message: 'Title requires a maximum length of 1000 characters',
    })
    .default('No description'),
  required: z.boolean().default(false),
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
            minLength: z.number().min(1).max(100).optional(),
            maxLength: z.number().min(2).max(100).optional(),
          }),
          z.object({
            type: z.literal(InputType.number.valueOf()),
            default: z.number().min(0),
            minimum: z.number().min(0).optional(),
            maximum: z.number().min(1).optional(),
          }),
          z.object({
            type: z.literal(InputType.enum.valueOf()),
            enum: z.array(z.string()).nonempty(),
          }),
          z.object({
            type: z.literal(InputType.boolean.valueOf()),
            default: z.boolean(),
          }),
          z.object({
            type: z.literal(InputType.array.valueOf()),
            array: z.array(z.string()).nonempty(),
            default: z.array(z.string()).nonempty(),
          }),
        ])
        .and(baseShape)
    )
    .superRefine((data, ctx) => {
      // TODO: compare min max string (type=string + type number)
      if (data[0].type === InputType.string.valueOf()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Min should be less than Max',
        });
      }
    }),
});
