import { Lambda, waitUntilFunctionActive } from '@aws-sdk/client-lambda';
import { config } from './config.js';
import { logger } from '@takaro/util';

interface CreateLambdaOptions {
  domainId: string;
}
const log = logger('aws:lambda');

export async function createLambda({ domainId }: CreateLambdaOptions) {
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

  const templateFn = await lambda.getFunction({
    FunctionName: 'takaro_template',
  });

  await lambda.createFunction({
    ...templateFn.Configuration,
    FunctionName: domainId,
    Role: templateFn.Configuration?.Role,
    Layers: templateFn.Configuration?.Layers?.map((layer) => layer.Arn).filter((arn): arn is string => !!arn),
    Tags: {
      domainId,
    },
    Code: {
      S3Bucket: config.get('aws.s3Bucket'),
      S3Key: 'code',
    },
  });
  log.debug('Created lambda function, waiting for it to be ready', domainId);
  await waitUntilFunctionActive(
    {
      client: lambda,
      maxWaitTime: 60,
    },
    { FunctionName: domainId },
  );
}
