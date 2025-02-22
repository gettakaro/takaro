import { Controller, Get, getMetadataArgsStorage, Res } from 'routing-controllers';
import { Response } from 'express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { routingControllersToSpec, ResponseSchema } from 'routing-controllers-openapi';
import { IsBoolean } from 'class-validator';
import { getMetrics, health } from '@takaro/util';
import { OpenAPIObject } from 'openapi3-ts';
import { PERMISSIONS } from '@takaro/auth';
import { EventMapping } from '@takaro/modules';

let spec: OpenAPIObject | undefined;

export class HealthOutputDTO {
  @IsBoolean()
  healthy!: boolean;
}
@Controller()
export class Meta {
  @Get('/healthz')
  @ResponseSchema(HealthOutputDTO)
  async getHealth() {
    return { healthy: true };
  }

  @Get('/readyz')
  @ResponseSchema(HealthOutputDTO)
  async getReadiness() {
    const healthy = await health.check();
    return { healthy };
  }

  @Get('/openapi.json')
  async getOpenApi() {
    if (spec) return spec;

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

    spec = routingControllersToSpec(
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

  @Get('/')
  getRoot(@Res() res: Response) {
    return res.redirect('/api.html');
  }

  @Get('/api.html')
  getOpenApiHtml() {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <script
          type="module"
          src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"
        ></script>
      </head>
      <body>
        <rapi-doc
          spec-url="/openapi.json"
          render-style="read"
          fill-request-fields-with-example="false"
          persist-auth="true"

          sort-tags="true"
          sort-endpoints-by="method"

          show-method-in-nav-bar="as-colored-block"
          show-header="false"
          allow-authentication="true"
          allow-server-selection="false"

          schema-style="table"
          schema-expand-level="1"
          default-schema-tab="schema"

          primary-color="#664de5"
          bg-color="#151515"
          text-color="#c2c2c2"
          header-color="#353535"
        />
      </body>
    </html>
    `;
  }

  @Get('/metrics')
  getMetrics() {
    return getMetrics();
  }
}
