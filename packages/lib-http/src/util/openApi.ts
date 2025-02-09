import { getMetadataArgsStorage } from 'routing-controllers';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { PERMISSIONS } from '@takaro/auth';
import { EventMapping } from '@takaro/modules';

export async function getSpec() {
  const { getMetadataStorage } = await import('class-validator');
  const classTransformerStorage = await import(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore were doing an import of internal code and ts doesnt like that
    // But this does work, trust me bro...
    'class-transformer/cjs/storage.js'
  );

  const metadataArgsStorage = getMetadataArgsStorage();
  const metadataStorage = getMetadataStorage();
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
    classTransformerMetadataStorage: classTransformerStorage.defaultMetadataStorage,
    classValidatorMetadataStorage: metadataStorage,
    forbidNonWhitelisted: true,
  });

  const spec = routingControllersToSpec(
    metadataArgsStorage,
    {},
    {
      info: {
        title: `Takaro ${process.env.PACKAGE || 'API'}`,
        version: `${process.env.TAKARO_VERSION} - ${process.env.TAKARO_COMMIT} `,
        contact: {
          name: 'Takaro Team',
          email: 'support@takaro.io',
          url: 'https://takaro.io',
        },
      },
      components: {
        schemas,
        securitySchemes: {
          adminAuth: {
            description: 'Used for system administration, like creating or deleting domains',
            type: 'apiKey',
            in: 'header',
            name: 'x-takaro-admin-token',
          },
          domainAuth: {
            description: 'Used for anything inside a domain. Players, GameServers, etc.',
            type: 'apiKey',
            in: 'cookie',
            name: 'takaro-token',
          },
        },
      },
    },
  );

  // Add required permissions to operation descriptions

  const requiredPermsRegex = /authMiddleware\((.+)\)/;

  metadataArgsStorage.uses.forEach((use) => {
    const requiredPerms =
      use.middleware.name
        .match(requiredPermsRegex)?.[1]
        .split(',')
        .map((p) => `\`${p}\``)
        .join(', ') || [];

    const operationId = `${use.target.name}.${use.method}`;

    if (!requiredPerms.length) return;

    // Find the corresponding path and method in spec
    Object.keys(spec?.paths ?? []).forEach((pathKey) => {
      const pathItem = spec?.paths[pathKey];
      Object.keys(pathItem).forEach((method) => {
        const operation = pathItem[method];
        if (operation.operationId === operationId) {
          // Update the description with required permissions
          operation.description = (operation.description || '') + `\n\n Required permissions: ${requiredPerms}`;
        }
      });
    });
  });

  // Add the operationId to the description, this helps users find the corresponding function call in the API client.
  Object.keys(spec.paths).forEach((pathKey) => {
    const pathItem = spec?.paths[pathKey];
    Object.keys(pathItem).forEach((method) => {
      const operation = pathItem[method];
      // Api client exposes it as roleControllerSearch
      // Current value is RoleController.search so lets adjust
      // Capitalize the part after . and remove the .
      const split = operation.operationId.split('.');
      const cleanOperationId = split[0] + split[1].charAt(0).toUpperCase() + split[1].slice(1);
      operation.description = (operation.description || '') + `<br> OperationId: \`${cleanOperationId}\``;
    });
  });

  if (spec.components?.schemas) {
    spec.components.schemas.PERMISSIONS = {
      enum: Object.values(PERMISSIONS),
    };
  }

  // Force event meta to be the correct types
  // TODO: figure out how to do this 'properly' with class-validator
  const allEvents = Object.values(EventMapping).map((e) => e.name);

  const eventOutputMetaSchema = spec.components?.schemas?.EventOutputDTO;
  if (eventOutputMetaSchema && 'properties' in eventOutputMetaSchema && eventOutputMetaSchema.properties) {
    eventOutputMetaSchema.properties.meta = {
      oneOf: [...allEvents.map((e) => ({ $ref: `#/components/schemas/${e}` }))],
    };
  }

  return spec;
}
