import { errors, logger } from '@takaro/util';
import { createTransport } from 'nodemailer';
import { EMAIL_TEMPLATES } from './templates.js';

import { config } from './config.js';

export interface ISendOptions {
  address: string;
  template: keyof typeof EMAIL_TEMPLATES;
  data: Record<string, unknown>
}

const log = logger('email:send');
export const transporter = createTransport(config.get('mail'));

export async function send(opts: ISendOptions) {
  const template = EMAIL_TEMPLATES[opts.template];

  if (!template) {
    log.error(`Template ${opts.template} does not exist`);
    throw new errors.InternalServerError();
  }

  const html = template.body(opts.data);

  const result = await transporter.sendMail({
    from: '"noreply@takaro.io" <noreply@takaro.io>',
    to: opts.address,
    subject: template.subject,
    html
  });

  log.info('Sent an email', { ...opts });
  return result;
}
