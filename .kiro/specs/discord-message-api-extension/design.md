# Discord Message API Extension Design

## Codebase Analysis

### Discovered Patterns and Conventions

**API Architecture**
- Controllers use routing-controllers decorators (@JsonController, @Post, @Put, @Delete)
- All API endpoints return APIOutput<T> wrapper using apiResponse() helper
- DTOs extend TakaroDTO base class for consistent serialization
- Service layer handles business logic, controllers remain thin
- Error handling uses @takaro/util errors (BadRequestError, NotFoundError, etc.)

**Discord Integration Pattern**
- DiscordBot singleton handles Discord.js client operations
- DiscordService provides business logic layer
- Metrics wrapped around all Discord operations via DiscordMetrics
- Consistent error mapping through DiscordErrorHandler

**DTO and Response Patterns**
- Input DTOs suffixed with InputDTO (e.g., SendMessageInputDTO)
- Output DTOs suffixed with OutputDTO wrapped in APIOutput
- Controller-specific API DTOs extend APIOutput<ServiceDTO>
- Validation using class-validator decorators

**Code Style**
- TypeScript with strict typing
- Async/await pattern for all async operations
- Logging via this.log with contextual information
- Metrics recording for all external operations

### Existing Systems to Extend

1. **DiscordService** (`packages/app-api/src/service/DiscordService.ts`)
   - Current sendMessage method (lines 327-401)
   - Existing validation patterns (validateEmbedContent, validateUrl)
   - Permission checking mechanisms

2. **DiscordBot** (`packages/app-api/src/lib/DiscordBot.ts`)
   - Current sendMessage implementation (lines 68-119)
   - Metrics integration pattern
   - Discord.js Message object handling

3. **DiscordController** (`packages/app-api/src/controllers/DiscordController.ts`)
   - RESTful endpoint patterns
   - OpenAPI documentation structure
   - Response handling with apiResponse()

4. **API Client** (`packages/lib-apiclient/src/generated/api.ts`)
   - Generated TypeScript client methods
   - Existing Discord API patterns

## Extension vs. Creation Analysis

### Systems Being Extended

1. **DiscordService.sendMessage** - Extend to return message data
   - Currently returns void (line 258)
   - Will return the Discord Message object from DiscordBot
   - No breaking changes - existing code ignores return value

2. **DiscordController endpoints** - Add two new endpoints
   - Following existing pattern: `/discord/channels/:id/message` (POST)
   - New: `/discord/messages/:id` (PUT) for updates
   - New: `/discord/messages/:id` (DELETE) for deletion

3. **DiscordBot class** - Add update and delete methods
   - Extending existing pattern from sendMessage
   - Same metrics and error handling approach
   - Reusing channel fetching and validation

4. **DTOs** - Extend existing SendMessageInputDTO pattern
   - Reuse for update endpoint (same validation rules)
   - Add new MessageOutputDTO for response

### New Components (Justified)

1. **MessageOutputDTO** - Required for API response
   - No existing DTO captures sent message data
   - Follows established DTO patterns
   - Minimal fields: id, channelId, content, embed

2. **UpdateMessageInputDTO** - Extends SendMessageInputDTO
   - Same validation but different context
   - Allows future divergence if needed

## Overview

This feature extends the Discord API to support full message lifecycle management. The extension adds:
- Message ID return from sendMessage operations
- Update capability for existing messages
- Delete capability for messages

**Key Objectives:**
- Maintain backward compatibility
- Enable dynamic Discord integrations
- Follow existing architectural patterns
- Minimize new code by extending current systems

**Non-goals:**
- Message history/retrieval APIs
- Bulk operations
- Message reactions or threads
- Cross-channel message operations

## Architecture

### Integration with Existing Architecture

```
[DiscordController] -> [DiscordService] -> [DiscordBot] -> [Discord.js]
        |                     |                  |
   [APIOutput]          [Validation]       [Metrics]
        |                     |                  |
   [API Client]         [Permissions]     [Error Handler]
```

### Extended Data Flow

**Send Message (Modified)**
1. POST /discord/channels/:id/message
2. DiscordService.sendMessage returns Message
3. Transform to MessageOutputDTO
4. Return via apiResponse()

**Update Message (New)**
1. PUT /discord/messages/:id
2. DiscordService.updateMessage
3. DiscordBot.updateMessage
4. Return updated MessageOutputDTO

**Delete Message (New)**
1. DELETE /discord/messages/:id
2. DiscordService.deleteMessage
3. DiscordBot.deleteMessage
4. Return empty apiResponse()

## Components and Interfaces

### Extended Components

**DiscordBot** (`packages/app-api/src/lib/DiscordBot.ts`)
```typescript
// Add after sendMessage method (line 119)
async fetchMessage(messageId: string): Promise<Message>
async updateMessage(messageId: string, content?: string, embed?: DiscordEmbedInputDTO): Promise<Message>
async deleteMessage(messageId: string): Promise<void>

// Implementation note: Discord.js requires fetching the message first
// We'll iterate through cached channels to find the message
```

**DiscordService** (`packages/app-api/src/service/DiscordService.ts`)
```typescript
// Modify sendMessage return type (line 327)
async sendMessage(channelId: string, message: SendMessageInputDTO): Promise<MessageOutputDTO>

// Add new methods after sendMessage
async updateMessage(messageId: string, message: UpdateMessageInputDTO): Promise<MessageOutputDTO>
async deleteMessage(messageId: string): Promise<void>
```

**DiscordController** (`packages/app-api/src/controllers/DiscordController.ts`)
```typescript
// Modify existing endpoint to return MessageOutputDTOAPI
@Post('/discord/channels/:id/message')
async sendMessage(...): Promise<MessageOutputDTOAPI>

// Add new endpoints
@Put('/discord/messages/:id')
async updateMessage(...): Promise<MessageOutputDTOAPI>

@Delete('/discord/messages/:id')
async deleteMessage(...): Promise<APIOutput>
```

### New Components

**MessageOutputDTO** (`packages/app-api/src/service/DiscordService.ts`)
```typescript
export class MessageOutputDTO extends TakaroDTO<MessageOutputDTO> {
  @IsString()
  id!: string;
  
  @IsString()
  channelId!: string;
  
  @IsString()
  @IsOptional()
  content?: string;
  
  @Type(() => DiscordEmbedInputDTO)
  @ValidateNested()
  @IsOptional()
  embed?: DiscordEmbedInputDTO;
}
```

**UpdateMessageInputDTO** 
```typescript
export class UpdateMessageInputDTO extends SendMessageInputDTO {
  // Same as SendMessageInputDTO - message and/or embed
}
```

**MessageOutputDTOAPI** (Controller DTO)
```typescript
class MessageOutputDTOAPI extends APIOutput<MessageOutputDTO> {
  @Type(() => MessageOutputDTO)
  @ValidateNested()
  declare data: MessageOutputDTO;
}
```

## Data Models

### Message ID Storage
- Message IDs are ephemeral - not stored in database
- IDs come from Discord API (snowflake format)
- Messages are fetched directly from Discord using message ID

### API Response Format
Following existing pattern:
```json
{
  "meta": {
    "serverTime": "2024-01-15T10:30:00Z"
  },
  "data": {
    "id": "1234567890123456789",
    "channelId": "9876543210987654321",
    "content": "Hello Discord!",
    "embed": { ... }
  }
}
```

## Implementation Details

### Following Existing Patterns

**Permission Checking** (from validateGuildAccess pattern)
```typescript
// In updateMessage and deleteMessage
// Fetch message from Discord to get channel and guild info
const message = await discordBot.fetchMessage(messageId);
const guild = await this.validateGuildAccess(message.guild.id);
// Check user permissions...
```

**Error Handling** (from sendMessage pattern)
```typescript
try {
  // Operation
} catch (error) {
  DiscordErrorHandler.logError(error, context);
  if (error instanceof errors.TakaroError) throw error;
  throw DiscordErrorHandler.mapDiscordError(error);
}
```

**Metrics Integration**
```typescript
return await DiscordMetrics.measureOperation(
  async () => {
    // Discord.js operation
    DiscordMetrics.recordMessageUpdated(guildId, channelId);
  },
  'updateMessage',
  guildId
);
```

### Security Patterns
- Reuse existing permission validation from sendMessage
- Channel ID validation ensures message belongs to accessible guild
- Same SEND_DISCORD_MESSAGE permission for all operations

## Error Handling

### Following Existing Patterns

**Not Found Errors**
```typescript
if (!message) {
  throw new errors.NotFoundError(`Discord message ${messageId} not found`);
}
```

**Permission Errors**
```typescript
if (!hasPermission) {
  throw new errors.ForbiddenError();
}
```

**Discord API Errors**
- 10008: Unknown Message
- 50001: Missing Access
- 50013: Missing Permissions
All mapped via existing DiscordErrorHandler

## Testing Strategy

### Unit Tests
Following existing test patterns in `__tests__` directories:
- Service method tests with mocked DiscordBot
- Controller tests with mocked service
- DTO validation tests
- Mock Discord.js client responses

### Test File Structure
```
DiscordService.unit.test.ts
- describe('sendMessage') - modify to test return value
- describe('updateMessage') - new test suite
- describe('deleteMessage') - new test suite

DiscordBot.unit.test.ts
- Mock Discord.js message operations
- Test error scenarios
```