import { Client, GatewayIntentBits, GuildBasedChannel, Message, TextChannel } from 'discord.js';
import { errors, logger } from '@takaro/util';
import { config } from '../config.js';
import { DiscordService } from '../service/DiscordService.js';

class DiscordBot {
  private client: Client;
  private log = logger('DiscordBot');

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });
  }

  get inviteLink() {
    return `https://discord.com/oauth2/authorize?client_id=${this.client.user?.id}&scope=bot`;
  }

  get botUserId() {
    return this.client.user?.id;
  }

  async start() {
    if (!config.get('discord.botToken')) {
      this.log.warn('No discord bot token provided, skipping discord bot startup');
      return;
    }

    this.client.on('ready', (client) => {
      this.log.info(`Logged in as ${client.user.tag}!`);
      this.log.info(`Invite link: ${this.inviteLink}`);
      return;
    });

    if (config.get('discord.handleEvents')) {
      this.log.info('Setting up event handling');
      this.client.on('messageCreate', (message) => this.messageHandler(message));
    } else {
      this.log.info('Event handling is disabled');
    }

    try {
      await this.client.login(config.get('discord.botToken'));
    } catch (_error) {
      throw new errors.InternalServerError();
    }
  }

  async getChannel(channelId: string): Promise<GuildBasedChannel> {
    return this.client.channels.fetch(channelId) as Promise<GuildBasedChannel>;
  }

  async sendMessage(channelId: string, message: string) {
    const channel = await this.getChannel(channelId);

    if (!channel) {
      throw new errors.BadRequestError('Channel not found');
    }

    if (!channel.isTextBased) {
      throw new errors.BadRequestError('Channel is not text based');
    }

    const textChannel = channel as TextChannel;

    return textChannel.send(message);
  }

  async messageHandler(message: Message) {
    if (!message.inGuild()) {
      // Ignore DMs
      return;
    }

    const domainId = await DiscordService.NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(message.guild.id);

    if (!domainId) {
      // Ignore messages from guilds that are not linked to a domain
      return;
    }

    const service = new DiscordService(domainId);
    await service.handleMessage(message);
  }
}

export const discordBot = new DiscordBot();
