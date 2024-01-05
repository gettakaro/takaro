import { Controller, Get } from 'routing-controllers';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { ResponseSchema } from 'routing-controllers-openapi';
import { IsBoolean } from 'class-validator';
import { getMetrics, health } from '@takaro/util';
import { OpenAPIObject } from 'openapi3-ts';
import { PERMISSIONS } from '@takaro/auth';

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

    const storage = getMetadataArgsStorage();
    const schemas = validationMetadatasToSchemas({
      refPointerPrefix: '#/components/schemas/',
      classTransformerMetadataStorage: classTransformerStorage.defaultMetadataStorage,
      classValidatorMetadataStorage: getMetadataStorage(),
      forbidNonWhitelisted: true,
    });

    spec = routingControllersToSpec(
      storage,
      {},
      {
        components: {
          schemas,
          securitySchemes: {
            adminAuth: {
              description: 'Used for system administration, like creating or deleting domains',
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
            domainAuth: {
              description: 'Used for anything inside a domain. Players, GameServers, etc.',
              type: 'apiKey',
              in: 'cookie',
              name: 'takaro-token',
            },
          },
        },
      }
    );

    const requiredPermsRegex = /authMiddleware\((.+)\)/;

    storage.uses.forEach((use) => {
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
            operation.description = (operation.description || '') + ` Required permissions: ${requiredPerms}`;
          }
        });
      });
    });

    if (spec.components?.schemas) {
      spec.components.schemas.PERMISSIONS = {
        enum: Object.values(PERMISSIONS),
      };
    }

    return spec;
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
          allow-authentication="false"
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
