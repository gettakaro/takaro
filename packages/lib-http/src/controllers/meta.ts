import { Controller, Get, getMetadataArgsStorage, Res } from 'routing-controllers';
import { Response } from 'express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { routingControllersToSpec, ResponseSchema } from 'routing-controllers-openapi';
import { IsBoolean } from 'class-validator';
import { getMetrics, health } from '@takaro/util';
import { OpenAPIObject } from 'openapi3-ts';
import { PERMISSIONS } from '@takaro/auth';
import { EventMapping } from '@takaro/modules';
import { randomUUID } from 'crypto';
import dedent from 'dedent';

let spec: OpenAPIObject | undefined;

export class HealthOutputDTO {
  @IsBoolean()
  healthy!: boolean;
}

function addSearchExamples(original: OpenAPIObject): OpenAPIObject {
  // Copy the spec so we don't mutate the original
  const spec = JSON.parse(JSON.stringify(original));

  // Add some examples and info to all the POST /search endpoints
  Object.keys(spec.paths).forEach((pathKey) => {
    const pathItem = spec?.paths[pathKey];
    Object.keys(pathItem).forEach((method) => {
      const operation = pathItem[method];
      if (method === 'post' && pathKey.endsWith('/search')) {
        const standardExamples = {
          list: {
            summary: 'List all',
            value: {},
          },
          advanced: {
            summary: 'Advanced search',
            description: dedent`All /search endpoints allow you to combine different filters, search terms, ranges, and extend options.
            Filters are exact matches, search terms are partial matches, ranges are greater than or less than comparisons, 
            and extend allows you to include related entities in the response.
            
            Ranges allow you to make queries like "all records created in the last 7 days" or "all records with an age greater than 18".

            In search and filter sections, you pass an array of values for each property 
            These values are OR'ed together. So we'll get 2 records back in this case, if the IDs exist.

            Eg: \`{"filters": {"id": ["${randomUUID()}", "${randomUUID()}"]}}\`

            Different filters will be AND'ed together.
            This will return all records where the name is John and the age is 19.

            Eg: \`{"filters": {"name": "John", "age": 19}}\`
            
            The extend parameter allows including related data:
            Eg: \`{"extend": ["roles", "gameServers"]}\`
            `,
            value: {
              filters: {
                id: ['ea85ddf4-2885-482f-adc6-548fbe3fd8af'],
              },
              greaterThan: { createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
            },
          },
          withRelations: {
            summary: 'Search with related data',
            description:
              'Use the extend parameter to include related entities in the response, reducing the need for multiple API calls.',
            value: {
              filters: {
                name: ['admin'],
              },
              extend: ['roles', 'gameServers'],
              page: 1,
              limit: 10,
            },
          },
        };

        if (!operation.requestBody) {
          operation.requestBody = {
            content: {
              'application/json': {
                examples: standardExamples,
              },
            },
          };
        }

        operation.requestBody.content['application/json'].examples = {
          ...standardExamples,
          ...operation.requestBody.content['application/json'].examples,
        };
      }
    });
  });

  return spec;
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

    spec = addSearchExamples(spec);
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
          src="https://cdn.jsdelivr.net/npm/rapidoc@9.3.8"
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
