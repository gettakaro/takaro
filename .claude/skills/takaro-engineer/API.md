# API Development

## Controller Structure

Controllers in `packages/app-api/src/controllers/`:

```typescript
@OpenAPI({ security: [{ domainAuth: [] }] })
@JsonController('/player')
export class BanController {

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(BanOutputDTOAPI)
  @Get('/ban/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new BanService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }
}
```

## Route Decorators

| Decorator | Purpose |
|-----------|---------|
| `@JsonController('/path')` | Define controller base path |
| `@Get('/path')`, `@Post()`, `@Put()`, `@Delete()` | HTTP methods |
| `@UseBefore(middleware)` | Apply middleware |
| `@ResponseSchema(DTO)` | Define response type |
| `@OpenAPI({...})` | API documentation |
| `@Body()`, `@Params()`, `@Req()`, `@Res()` | Request data |

## Permissions

Defined in `packages/lib-auth/src/lib/permissions.ts`:

```typescript
export enum PERMISSIONS {
  'ROOT' = 'ROOT',
  'READ_USERS' = 'READ_USERS',
  'MANAGE_USERS' = 'MANAGE_USERS',
  'READ_PLAYERS' = 'READ_PLAYERS',
  'MANAGE_PLAYERS' = 'MANAGE_PLAYERS',
  // ...
}
```

Apply with:
```typescript
@UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
```

Empty array `[]` = any authenticated user.

## Adding a New Endpoint

### 1. Define DTOs

```typescript
// Input DTO
export class MyInputDTO extends TakaroDTO<MyInputDTO> {
  @IsString()
  @MinLength(1)
  myField: string;
}

// Output wrapper
export class MyOutputDTOAPI extends APIOutput<MyOutputDTO> {
  @Type(() => MyOutputDTO)
  @ValidateNested()
  declare data: MyOutputDTO;
}
```

### 2. Add Service Method

In `packages/app-api/src/service/`:

```typescript
@traceableClass('service:myentity')
export class MyService extends TakaroService<...> {
  async create(data: MyInputDTO) {
    return this.repo.create(data);
  }
}
```

### 3. Add Controller Endpoint

```typescript
@UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MY_RESOURCE]))
@ResponseSchema(MyOutputDTOAPI)
@Post('/myresource')
async create(@Req() req: AuthenticatedRequest, @Body() data: MyInputDTO) {
  const service = new MyService(req.domainId);
  return apiResponse(await service.create(data));
}
```

### 4. Add Permission (if new)

1. Add to enum in `packages/lib-auth/src/lib/permissions.ts`
2. Add details to permission object
3. Create migration to add permission to database

### 5. Write Tests

```typescript
import { IntegrationTest, SetupGameServerPlayers, expect } from '@takaro/test';

new IntegrationTest<SetupGameServerPlayers.ISetupData>({
  group: 'MyController',
  snapshot: true,
  name: 'Create my resource',
  setup: SetupGameServerPlayers.setup,
  test: async function () {
    return this.client.myResource.myResourceControllerCreate({
      myField: 'test value',
    });
  },
});
```

## Validation

### Parameter Validators

In `packages/app-api/src/lib/validators.ts`:

```typescript
export class ParamId {
  @IsUUID('4')
  id!: string;
}
```

### Body Validation

Use class-validator decorators:

```typescript
@IsString()
@IsUUID('4')
@IsOptional()
@IsEnum(MyEnum)
@ValidateNested()
@Type(() => NestedDTO)
```

## File Locations

| What | Where |
|------|-------|
| Controllers | `packages/app-api/src/controllers/` |
| Services | `packages/app-api/src/service/` |
| Validators | `packages/app-api/src/lib/validators.ts` |
| Permissions | `packages/lib-auth/src/lib/permissions.ts` |
| Integration tests | `packages/app-api/src/controllers/__tests__/` |
