import { IsString } from 'class-validator';
import OpenAI from 'openai';
import { ctx, errors, TakaroDTO } from '@takaro/util';
import { getSpec } from '@takaro/http';
import { ModuleOutputDTO } from '../service/Module/dto.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as url from 'url';
import { config } from '../config.js';
import { Redis } from '@takaro/db';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export class AIOptionsDTO extends TakaroDTO<AIOptionsDTO> {
  @IsString()
  prompt: string;
}

class AI {
  private client = new OpenAI({
    apiKey: config.get('ai.apiKey'),
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://takaro.io',
      'X-Title': 'Takaro',
    },
  });

  /**
   * This function loads in general context from Takaro like docs, apiclient, ...
   */
  async getSystemContext() {
    const baseDir = join(__dirname, '../');
    const docs = await readFile(join(baseDir, 'combined_docs.txt'), 'utf-8');
    const modules = await readFile(join(baseDir, 'combined_modules.txt'), 'utf-8');
    const apiClient = JSON.stringify(await getSpec());

    return { docs, modules, apiClient };
  }

  private getRedisKey(moduleId: string) {
    const userId = ctx.data.user;
    if (!userId) throw new errors.BadRequestError('User not found');
    return `ai:${userId}:${moduleId}`;
  }

  async resetChat(moduleId: string) {
    const redis = await Redis.getClient('ai');
    await redis.del(this.getRedisKey(moduleId));
  }

  async prompt(mod: ModuleOutputDTO, opts: AIOptionsDTO): Promise<string> {
    if (!config.get('ai.apiKey')) throw new errors.BadRequestError('AI is not configured');
    const context = await this.getSystemContext();

    const redis = await Redis.getClient('ai');
    const history = await redis.get(this.getRedisKey(mod.id));

    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // If there's a history, use it
    if (history) {
      const parsed = JSON.parse(history);

      for (const message of parsed) {
        messages.push({
          role: message.role,
          content: message.content,
        });
      }

      messages.push({
        role: 'user',
        content: opts.prompt,
      });
    }
    // Otherwise, seed it with some system messages
    else {
      messages = [
        {
          role: 'system',
          content: `You are a helpful software engineer helping to write modules for Takaro. 
    With all your experience, you know that
    - Takaro modules are written in Javascript
    - They are small and contained 'packages'. They run in a sandboxed environment where each invocation is stateless
    - ModuleTransferDTO is a internal type. NEVER tell a user to edit this file. If you feel like there are changes needed in this structure, you should explain it to the user is natural language like 'edit your command trigger and set to to _x_'
    - A lot of the functions inside talk to the Takaro API which is relatively slow. You should use Promise.all() whenever appropriate.
    - We are making edits inside the Takaro dashboard, so whenever you refer to a certain function, use the name! Avoid file paths, as the user cannot see those.
    Here are a bunch of example modules: ${context.modules}.
    And here's the docs: ${context.docs}.
    You can see that the apiClient is generated from the OpenAPI spec. Here's a stringified version of it: ${context.apiClient}`,
        },
        {
          role: 'system',
          content: `Here's a stringified module you are working on: ${JSON.stringify(mod)}`,
        },
        {
          role: 'user',
          content: opts.prompt,
        },
      ];
    }

    const completion = await this.client.chat.completions.create({
      model: config.get('ai.modelId'),
      messages,
    });

    const resp = completion.choices[0].message.content;
    if (!resp) return 'I am sorry, I do not know how to respond to that.';

    // Save the history
    await redis.set(
      this.getRedisKey(mod.id),
      JSON.stringify([
        ...messages,
        {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content,
        },
      ]),
    );

    return resp;
  }
}

export const ai = new AI();
