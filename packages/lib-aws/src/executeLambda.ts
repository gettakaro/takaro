import { Lambda } from '@aws-sdk/client-lambda';
import { config } from './config.js';
import { createLambda } from './createLambda.js';
import { errors, logger } from '@takaro/util';

interface executeLambdaOpts {
  domainId: string;
  fn: string;
  data: Record<string, unknown>;
  token: string;
}

interface IFunctionResult {
  success: boolean;
  logs: any[];
  requestId?: string;
}

const lambda = new Lambda({
  region: config.get('aws.region'),
  credentials: {
    accessKeyId: config.get('aws.accessKeyId'),
    secretAccessKey: config.get('aws.secretAccessKey'),
  },
});

const log = logger('aws:lambda');

export async function executeLambda({ data, fn, token, domainId }: executeLambdaOpts) {
  if (!config.get('aws.accessKeyId') && !config.get('aws.secretAccessKey')) {
    throw new errors.ConfigError('AWS credentials not set');
  }

  try {
    const res = await tryExecuteLambda({ data, fn, token, domainId });
    return res;
  } catch (error) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      log.warn('Lambda not found, creating...');
      await createLambda({ domainId });
      return await tryExecuteLambda({ data, fn, token, domainId });
    } else {
      log.error('executeLambda', error);
      return {
        logs: [],
        success: false,
      };
    }
  }
}

async function tryExecuteLambda({ data, fn, token, domainId }: executeLambdaOpts) {
  const result = await lambda.invoke({ FunctionName: domainId, Payload: JSON.stringify({ data, token, fn }) });
  let returnVal: IFunctionResult = {
    requestId: result.$metadata.requestId,
    logs: [],
    success: false,
  };

  if (result.Payload) {
    const tmpResult = Buffer.from(result.Payload).toString();
    const parsedRes = JSON.parse(tmpResult);

    if (parsedRes.errorMessage && parsedRes.errorMessage.includes('Task timed out')) {
      returnVal['success'] = false;
      returnVal['logs'] = [
        {
          msg: 'Task timed out',
        },
      ];
    } else if (parsedRes.body.includes('Unexpected end of input')) {
      returnVal['success'] = false;
      returnVal['logs'] = [
        {
          msg: 'Syntax error, your javascript code is invalid',
        },
      ];
    } else {
      returnVal = JSON.parse(parsedRes.body);
    }
  }
  return returnVal;
}
