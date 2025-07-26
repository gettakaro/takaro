# Implementation Tasks for Discord Message API Extension

## Progress Summary
- **Phase 1**: ✅ Complete (Tasks 1-4)
- **Phase 2**: ✅ Complete (Tasks 5-8)
- **Phase 3**: ✅ Complete (Tasks 9-13)
- **Phase 4**: ✅ Complete (Tasks 14-16)

**All tasks completed successfully!**

## Overview

This implementation extends the Discord API to support message lifecycle management through three phases:
1. Core DTOs and message return functionality
2. Update and delete operations in DiscordBot
3. New API endpoints and service methods

Each task builds incrementally, allowing partial testing and validation at each phase.

## Phase 1: DTOs and Message Return
Enable sendMessage to return message data while maintaining backward compatibility.

- [x] Task 1: Create MessageOutputDTO and controller DTOs
  - **Prompt**: Create MessageOutputDTO class in DiscordService.ts after SendMessageInputDTO. Include fields: id (string), channelId (string), content (optional string), embed (optional DiscordEmbedInputDTO). Add MessageOutputDTOAPI class in DiscordController.ts extending APIOutput<MessageOutputDTO> following the pattern of GuildOutputDTOAPI.
  - **Requirements**: REQ-MSG-001, REQ-MSG-002
  - **Design ref**: Section "New Components"
  - **Files**: packages/app-api/src/service/DiscordService.ts, packages/app-api/src/controllers/DiscordController.ts

- [x] Task 2: Modify DiscordBot.sendMessage to return sent message
  - **Prompt**: Update DiscordBot.sendMessage method to return the Discord Message object instead of void. Ensure the Message is returned from both content-only and embed paths. No other changes to the method logic.
  - **Requirements**: REQ-MSG-001
  - **Design ref**: Section "DiscordBot class"
  - **Files**: packages/app-api/src/lib/DiscordBot.ts

- [x] Task 3: Update DiscordService.sendMessage to return MessageOutputDTO
  - **Prompt**: Modify DiscordService.sendMessage to capture the returned Message from discordBot.sendMessage and transform it to MessageOutputDTO before returning. Extract id, channelId, content from the Message object. Handle the embed transformation if present.
  - **Requirements**: REQ-MSG-001, REQ-MSG-003
  - **Design ref**: Section "DiscordService.sendMessage"
  - **Files**: packages/app-api/src/service/DiscordService.ts

- [x] Task 4: Update DiscordController sendMessage endpoint
  - **Prompt**: Change DiscordController.sendMessage to capture the MessageOutputDTO from service.sendMessage and return it wrapped in apiResponse(). Update the OpenAPI response schema from APIOutput to MessageOutputDTOAPI. Add example response in OpenAPI docs.
  - **Requirements**: REQ-MSG-001, REQ-API-001
  - **Design ref**: Section "DiscordController endpoints"
  - **Files**: packages/app-api/src/controllers/DiscordController.ts

## Phase 2: DiscordBot Update and Delete Methods
Implement core Discord.js operations for message management.

- [x] Task 5: Add fetchMessage method to DiscordBot
  - **Prompt**: Create fetchMessage method in DiscordBot that takes a messageId and searches through all cached text channels to find and return the message. Use DiscordMetrics.measureOperation wrapper. Throw NotFoundError if message not found. Include proper logging.
  - **Requirements**: REQ-MSG-004, REQ-ERR-001
  - **Design ref**: Section "DiscordBot class", "Implementation Details"
  - **Files**: packages/app-api/src/lib/DiscordBot.ts

- [x] Task 6: Implement DiscordBot.updateMessage
  - **Prompt**: Add updateMessage method that fetches the message using fetchMessage, then calls message.edit() with content and/or embed. Follow sendMessage pattern for embed conversion. Wrap in DiscordMetrics.measureOperation. Record metrics via DiscordMetrics.recordMessageUpdated.
  - **Requirements**: REQ-MSG-004, REQ-MSG-005
  - **Design ref**: Section "DiscordBot class"
  - **Files**: packages/app-api/src/lib/DiscordBot.ts

- [x] Task 7: Implement DiscordBot.deleteMessage
  - **Prompt**: Add deleteMessage method that fetches the message and calls message.delete(). Wrap in DiscordMetrics.measureOperation. Record metrics via DiscordMetrics.recordMessageDeleted. Handle already deleted messages gracefully.
  - **Requirements**: REQ-MSG-007, REQ-MSG-008
  - **Design ref**: Section "DiscordBot class"
  - **Files**: packages/app-api/src/lib/DiscordBot.ts

- [x] Task 8: Add metrics recording methods
  - **Prompt**: Add recordMessageUpdated and recordMessageDeleted static methods to DiscordMetrics class following the pattern of recordMessageSent. Include guildId and channelId labels.
  - **Requirements**: REQ-API-004
  - **Design ref**: Section "Metrics Integration"
  - **Files**: packages/app-api/src/lib/DiscordMetrics.ts

## Phase 3: Service Methods and API Endpoints
Complete the API with new endpoints and service orchestration.

- [x] Task 9: Create UpdateMessageInputDTO (Note: Used SendMessageInputDTO instead per user request)
  - **Prompt**: Add UpdateMessageInputDTO class in DiscordService.ts that extends SendMessageInputDTO. No additional fields needed. Add appropriate class-transformer and class-validator imports if missing.
  - **Requirements**: REQ-MSG-004
  - **Design ref**: Section "New Components"
  - **Files**: packages/app-api/src/service/DiscordService.ts

- [x] Task 10: Implement DiscordService.updateMessage
  - **Prompt**: Create updateMessage method that accepts messageId and UpdateMessageInputDTO. Fetch message via discordBot to get guild info, validate guild access and permissions using existing patterns. Call discordBot.updateMessage and transform result to MessageOutputDTO. Wrap in try-catch with DiscordErrorHandler.
  - **Requirements**: REQ-MSG-004, REQ-MSG-005, REQ-MSG-006
  - **Design ref**: Section "Permission Checking", "Error Handling"
  - **Files**: packages/app-api/src/service/DiscordService.ts

- [x] Task 11: Implement DiscordService.deleteMessage
  - **Prompt**: Create deleteMessage method that accepts messageId. Fetch message for permission validation, check guild access. Call discordBot.deleteMessage. Use same error handling pattern as updateMessage.
  - **Requirements**: REQ-MSG-007, REQ-MSG-008, REQ-MSG-009
  - **Design ref**: Section "Permission Checking", "Error Handling"
  - **Files**: packages/app-api/src/service/DiscordService.ts

- [x] Task 12: Add updateMessage endpoint to DiscordController
  - **Prompt**: Create PUT /discord/messages/:id endpoint with AuthService.getAuthMiddleware([PERMISSIONS.SEND_DISCORD_MESSAGE]). Accept UpdateMessageInputDTO in body. Call service.updateMessage and return result via apiResponse. Add comprehensive OpenAPI documentation with examples.
  - **Requirements**: REQ-MSG-004, REQ-API-002, REQ-API-003
  - **Design ref**: Section "DiscordController endpoints"
  - **Files**: packages/app-api/src/controllers/DiscordController.ts

- [x] Task 13: Add deleteMessage endpoint to DiscordController
  - **Prompt**: Create DELETE /discord/messages/:id endpoint with same auth as update. Call service.deleteMessage and return empty apiResponse(). Add OpenAPI documentation explaining the operation.
  - **Requirements**: REQ-MSG-007, REQ-API-002, REQ-API-003
  - **Design ref**: Section "DiscordController endpoints"
  - **Files**: packages/app-api/src/controllers/DiscordController.ts

## Phase 4: Testing
Ensure all functionality works correctly with comprehensive unit tests.

- [x] Task 14: Write DiscordBot unit tests
  - **Prompt**: Create unit tests for fetchMessage, updateMessage, and deleteMessage in DiscordBot.unit.test.ts. Mock Discord.js client and channels. Test success cases, not found errors, and Discord API errors. Follow existing test patterns.
  - **Requirements**: REQ-ERR-001, REQ-ERR-002
  - **Design ref**: Section "Testing Strategy"
  - **Files**: packages/app-api/src/lib/__tests__/DiscordBot.unit.test.ts

- [x] Task 15: Write DiscordService unit tests
  - **Prompt**: Add test cases to DiscordService.unit.test.ts for modified sendMessage (returns MessageOutputDTO), updateMessage, and deleteMessage. Mock DiscordBot methods. Test permission validation, error handling, and successful operations.
  - **Requirements**: REQ-MSG-006, REQ-MSG-009, REQ-ERR-003
  - **Design ref**: Section "Testing Strategy"
  - **Files**: packages/app-api/src/service/__tests__/DiscordService.unit.test.ts

- [x] Task 16: Update API client generation
  - **Prompt**: Run the API client generation script to update the TypeScript client with new endpoints and return types. Verify sendMessage now returns MessageOutputDTO and new methods exist.
  - **Requirements**: REQ-API-001
  - **Design ref**: Section "API Client"
  - **Files**: packages/lib-apiclient/src/generated/api.ts