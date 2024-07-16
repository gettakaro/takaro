import { ctx } from './context.js';
import { config } from './config.js';
import { DomainScoped } from './DomainScoped.js';
import { PostHog as PosthogInternal } from 'posthog-node';

interface IPosthogProperties {
  gameserver: string;
  module: string;
  player: string;
  user: string;
}

const blockedEvents: string[] = ['entity-killed', 'chat-message'];

const client =
  config.get('posthog.enabled') && config.get('posthog.apiKey')
    ? new PosthogInternal(config.get('posthog.apiKey'), { host: config.get('posthog.host') })
    : null;

export class PostHog extends DomainScoped {
  constructor(domainId: string) {
    super(domainId);
  }

  static getClient() {
    return client;
  }

  async trackEvent(eventName: string, properties: IPosthogProperties) {
    if (!config.get('posthog.enabled')) return;
    if (!client) return;
    if (blockedEvents.includes(eventName)) return;
    const distinctId = ctx.data.user || properties.user || properties.player || 'anonymous';

    client.capture({
      distinctId,
      event: eventName,
      properties: {
        domain: this.domainId,
        ...properties,
      },
    });
  }
}
