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

export const validationSchema = z.object({
  configFields: z.array(
    z
      .discriminatedUnion('type', [
        z.object({
          type: z.literal(InputType.string.valueOf()),
          minLength: z.number().min(1).max(100).default(4),
          maxLength: z.number().min(2).max(100).default(100),
        }),
      ])
      .and(baseShape)
  ),
});
