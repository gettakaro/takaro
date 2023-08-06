import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { decode } from 'libqp';

interface IMailhogOptions {
  baseURL: string;
}

interface IMessageQuery {
  start?: number;
  limit?: number;
}

interface ISearchQuery extends IMessageQuery {
  kind: 'from' | 'to' | 'containing';
  query: string;
}

interface IPath {
  Relays: string[];
  Mailbox: string;
  Domain: string;
  Params: string;
}

interface IMessageContent {
  Body: string;
  Headers: Record<string, string | string[]>;
  Size: number;
}

interface IMessage {
  ID: string;
  From: IPath;
  To: IPath[];
  Created: string; // date-time
  Content: IMessageContent;
}

interface IMessagesResponse {
  total: number;
  start: number;
  count: number;
  items: IMessage[];
}

export class MailhogAPI {
  private client: AxiosInstance;

  constructor(options: IMailhogOptions) {
    this.client = axios.create({
      baseURL: options.baseURL,
    });
  }

  public async getMessages(query?: IMessageQuery): Promise<IMessagesResponse> {
    try {
      const response: AxiosResponse<IMessagesResponse> = await this.client.get('/api/v2/messages', {
        params: query,
      });

      response.data.items = response.data.items.map((item) => {
        item.Content.Body = decode(item.Content.Body).toString();
        return item;
      });

      return response.data;
    } catch (err) {
      console.error('Error while fetching messages:', err);
      throw err;
    }
  }

  public async searchMessages(query: ISearchQuery): Promise<IMessagesResponse> {
    try {
      const response: AxiosResponse<IMessagesResponse> = await this.client.get('/api/v2/search', {
        params: query,
      });

      response.data.items = response.data.items.map((item) => {
        item.Content.Body = decode(item.Content.Body).toString();
        return item;
      });

      return response.data;
    } catch (err) {
      console.error('Error while searching messages:', err);
      throw err;
    }
  }
}
