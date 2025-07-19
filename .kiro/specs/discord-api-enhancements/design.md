# Design Document

## Overview

This design extends the existing Discord integration in the Takaro application by adding Discord API routes for role listing, channel listing, and enhanced message sending with embed support. The design builds upon the existing `DiscordController`, `DiscordService`, and `DiscordBot` infrastructure while maintaining consistency with the current architecture patterns.

## Architecture

The enhancement follows the existing three-layer architecture:

1. **Controller Layer** (`DiscordController.ts`) - HTTP endpoints and request/response handling
2. **Service Layer** (`DiscordService.ts`) - Business logic and Discord API interactions
3. **Bot Layer** (`DiscordBot.ts`) - Direct Discord.js client interactions

### Key Design Principles

- Maintain backward compatibility with existing Discord functionality
- Follow existing validation and error handling patterns
- Respect Discord API rate limits and permissions
- Ensure proper domain scoping for multi-tenant architecture
- Implement comprehensive permission checks

## Components and Interfaces

### 1. Discord Roles Listing

#### New DTOs

```typescript
class DiscordRoleOutputDTO extends TakaroDTO<DiscordRoleOutputDTO> {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  color: number;
}

class DiscordRoleArrayOutputDTOAPI extends APIOutput<DiscordRoleOutputDTO[]> {
  @Type(() => DiscordRoleOutputDTO)
  @ValidateNested({ each: true })
  declare data: DiscordRoleOutputDTO[];
}
```

#### New Controller Endpoints

- `GET /discord/guilds/:guildId/roles` - List all roles in a guild

#### New Service Methods

```typescript
class DiscordService {
  async getRoles(guildId: string): Promise<DiscordRoleOutputDTO[]>;
}
```

#### New Bot Methods

```typescript
class DiscordBot {
  async getGuildRoles(guildId: string): Promise<Role[]>;
}
```

### 2. Discord Channels Listing

#### New DTOs

```typescript
class DiscordChannelOutputDTO extends TakaroDTO<DiscordChannelOutputDTO> {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  type: number;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  topic?: string;
}

class DiscordChannelArrayOutputDTOAPI extends APIOutput<DiscordChannelOutputDTO[]> {
  @Type(() => DiscordChannelOutputDTO)
  @ValidateNested({ each: true })
  declare data: DiscordChannelOutputDTO[];
}
```

#### New Controller Endpoints

- `GET /discord/guilds/:guildId/channels` - List all channels in a guild

#### New Service Methods

```typescript
class DiscordService {
  async getChannels(guildId: string): Promise<DiscordChannelOutputDTO[]>;
}
```

#### New Bot Methods

```typescript
class DiscordBot {
  async getGuildChannels(guildId: string): Promise<GuildChannel[]>;
}
```

### 3. Enhanced Message Sending

#### Enhanced DTOs

```typescript
class SendMessageInputDTO extends TakaroDTO<SendMessageInputDTO> {
  @IsString()
  @IsOptional()
  message?: string; // Made optional for embed-only messages

  @Type(() => DiscordEmbedInputDTO)
  @ValidateNested()
  @IsOptional()
  embed?: DiscordEmbedInputDTO;
}

class DiscordEmbedInputDTO extends TakaroDTO<DiscordEmbedInputDTO> {
  @IsString()
  @IsOptional()
  @Length(1, 256)
  title?: string;

  @IsString()
  @IsOptional()
  @Length(1, 4096)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(16777215)
  color?: number;

  @Type(() => DiscordEmbedField)
  @ValidateNested({ each: true })
  @IsOptional()
  @ArrayMaxSize(25)
  fields?: DiscordEmbedField[];

  @Type(() => DiscordEmbedFooter)
  @ValidateNested()
  @IsOptional()
  footer?: DiscordEmbedFooter;

  @Type(() => DiscordEmbedImage)
  @ValidateNested()
  @IsOptional()
  thumbnail?: DiscordEmbedImage;

  @Type(() => DiscordEmbedImage)
  @ValidateNested()
  @IsOptional()
  image?: DiscordEmbedImage;

  @Type(() => DiscordEmbedAuthor)
  @ValidateNested()
  @IsOptional()
  author?: DiscordEmbedAuthor;

  @IsISO8601()
  @IsOptional()
  timestamp?: string;
}

class DiscordEmbedField extends TakaroDTO<DiscordEmbedField> {
  @IsString()
  @Length(1, 256)
  name: string;

  @IsString()
  @Length(1, 1024)
  value: string;

  @IsBoolean()
  @IsOptional()
  inline?: boolean;
}

class DiscordEmbedFooter extends TakaroDTO<DiscordEmbedFooter> {
  @IsString()
  @Length(1, 2048)
  text: string;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;
}

class DiscordEmbedImage extends TakaroDTO<DiscordEmbedImage> {
  @IsUrl()
  url: string;
}

class DiscordEmbedAuthor extends TakaroDTO<DiscordEmbedAuthor> {
  @IsString()
  @Length(1, 256)
  name: string;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}
```

#### Modified Controller Endpoints

- `POST /discord/channels/:id/message` - Enhanced to support embeds

#### Enhanced Service Methods

```typescript
class DiscordService {
  async sendMessage(channelId: string, message: SendMessageInputDTO): Promise<void>;
}
```

#### Enhanced Bot Methods

```typescript
class DiscordBot {
  async sendMessage(channelId: string, content?: string, embed?: EmbedBuilder): Promise<Message>;
}
```

## Data Models

### Existing Models (No Changes Required)

- `DiscordGuildModel` - Already contains necessary guild information
- `UserOnGuildModel` - Already handles user-guild relationships

### Data Flow

All Discord roles and channels data will be fetched directly from Discord API in real-time. No additional database storage is required as this data is managed by Discord and can change frequently.

## Error Handling

### Discord API Error Mapping

```typescript
enum DiscordErrorCodes {
  MISSING_PERMISSIONS = 50013,
  UNKNOWN_ROLE = 10011,
  UNKNOWN_USER = 10013,
  UNKNOWN_CHANNEL = 10003,
  UNKNOWN_GUILD = 10004,
  RATE_LIMITED = 429,
  MISSING_ACCESS = 50001,
}

class DiscordErrorHandler {
  static mapDiscordError(error: DiscordAPIError): TakaroError {
    switch (error.code) {
      case DiscordErrorCodes.MISSING_PERMISSIONS:
        return new errors.ForbiddenError('Bot lacks required Discord permissions');
      case DiscordErrorCodes.UNKNOWN_GUILD:
        return new errors.NotFoundError('Discord guild not found');
      case DiscordErrorCodes.UNKNOWN_CHANNEL:
        return new errors.NotFoundError('Discord channel not found');
      case DiscordErrorCodes.UNKNOWN_ROLE:
        return new errors.NotFoundError('Discord role not found');
      case DiscordErrorCodes.RATE_LIMITED:
        return new errors.TooManyRequestsError('Discord API rate limit exceeded');
      default:
        return new errors.InternalServerError('Discord API error');
    }
  }
}
```

### Permission Validation Strategy

1. **Guild Validation**: Ensure guild exists and is enabled for Takaro
2. **Bot Permissions**: Verify bot has required permissions in Discord
3. **User Permissions**: Check user has appropriate Takaro permissions
4. **Rate Limiting**: Implement request queuing and backoff

## Testing Strategy

### Unit Tests

- **Service Layer Tests**: Mock Discord API responses and test business logic
- **Controller Tests**: Test request/response handling and validation
- **DTO Validation Tests**: Ensure proper input validation for embeds
- **Error Handling Tests**: Test Discord API error mapping

### Integration Tests

- **Discord Bot Integration**: Test actual Discord API interactions in test environment
- **End-to-End Tests**: Test complete workflows from HTTP request to Discord response
- **Permission Tests**: Verify proper permission checking at all levels

### Test Data Strategy

- Use Discord test guilds for integration testing
- Mock Discord API responses for unit tests
- Test embed validation with various input combinations
- Test error scenarios and edge cases

## Implementation Details

### Discord API Rate Limits

- Implement request queuing for Discord API calls
- Add caching for roles and channels data (5-minute TTL)
- Use exponential backoff for rate limit handling
- Monitor rate limit headers and adjust request timing

### Security Considerations

- Validate all Discord IDs format and length
- Sanitize embed content to prevent XSS
- Ensure proper permission checks before Discord operations
- Validate embed URLs to prevent malicious links

### Performance Optimizations

- Cache Discord guild data to reduce API calls
- Implement request deduplication for concurrent requests
- Use Discord.js built-in caching where appropriate
- Batch operations where possible

### Backward Compatibility

- Maintain existing message sending functionality
- Ensure existing Discord webhook integrations continue working
- Preserve current permission model
- Support both plain text and embed messages

### Monitoring and Observability

- Add metrics for Discord API usage and rate limits
- Log Discord operations for audit trails
- Monitor error rates and response times
- Track embed usage patterns

## API Documentation

All new endpoints will follow OpenAPI specification with:

- Comprehensive request/response schemas
- Example requests and responses for embeds
- Error code documentation
- Permission requirements
- Rate limiting information

### Example API Usage

#### List Discord Roles

```http
GET /discord/guilds/123456789/roles
Authorization: Bearer <token>
```

#### List Discord Channels

```http
GET /discord/guilds/123456789/channels
Authorization: Bearer <token>
```

#### Send Embed Message

```http
POST /discord/channels/987654321/message
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Check out this embed!",
  "embed": {
    "title": "Server Status",
    "description": "All systems operational",
    "color": 65280,
    "fields": [
      {
        "name": "Players Online",
        "value": "42",
        "inline": true
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Migration Strategy

This is an additive enhancement with no breaking changes:

1. Deploy new endpoints alongside existing functionality
2. Update frontend components to use new Discord data
3. Gradually migrate existing message sending to support embeds
4. Monitor usage and performance metrics
5. Gather user feedback on embed functionality
