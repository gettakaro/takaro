import {
  Client,
  GatewayIntentBits,
  GuildBasedChannel,
  TextChannel,
} from 'discord.js';
import { errors, logger } from '@takaro/util';
import { config } from '../config.js';

class DiscordBot {
  private client: Client;
  private log = logger('DiscordBot');

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });
  }

  get inviteLink() {
    return `https://discord.com/oauth2/authorize?client_id=${this.client.user?.id}&scope=bot`;
  }

  async start() {
    if (!config.get('discord.botToken')) {
      this.log.warn(
        'No discord bot token provided, skipping discord bot startup'
      );
      return;
    }

    return new Promise<void>(async (resolve, reject) => {
      this.client.on('ready', (client) => {
        this.log.info(`Logged in as ${client.user.tag}!`);
        this.log.info(`Invite link: ${this.inviteLink}`);
        resolve();
      });

      try {
        await this.client.login(process.env.DISCORD_BOT_TOKEN);
      } catch (error) {
        reject(error);
      }
    });
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
}

export const discordBot = new DiscordBot();
