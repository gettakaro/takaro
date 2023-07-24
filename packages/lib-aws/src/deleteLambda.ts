import { Lambda } from '@aws-sdk/client-lambda';
import { config } from './config.js';

interface DeleteLambdaOptions {
  domainId: string;
}

export async function deleteLambda({ domainId }: DeleteLambdaOptions) {
  if (!config.get('aws.accessKeyId') && !config.get('aws.secretAccessKey')) {
    return;
  }

  const lambda = new Lambda({
    region: config.get('aws.region'),
    credentials: {
      accessKeyId: config.get('aws.accessKeyId'),
      secretAccessKey: config.get('aws.secretAccessKey'),
    },
  });

  await lambda.deleteFunction({
    FunctionName: domainId,
  });
}
