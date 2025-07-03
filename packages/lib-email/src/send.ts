import { errors, logger } from '@takaro/util';
import { createTransport, Transporter } from 'nodemailer';
import { EMAIL_TEMPLATES } from './templates.js';
import { PostmarkTransport } from 'nodemailer-postmark-transport';

import { config } from './config.js';

export interface ISendOptions {
  address: string;
  template: keyof typeof EMAIL_TEMPLATES;
  data: Record<string, unknown>;
}

const log = logger('email:send');

let transporter: Transporter;
if (config.get('mail.postmarkApiKey')) {
  log.info('Using Postmark as mail transport');
  transporter = createTransport(
    new PostmarkTransport({
      auth: {
        apiKey: config.get('mail.postmarkApiKey'),
      },
    }),
  );
} else {
  log.info('Using SMTP as mail transport');
  transporter = createTransport(config.get('mail'));
}

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
    html,
  });

  log.info('Sent an email', { ...opts });
  return result;
}
