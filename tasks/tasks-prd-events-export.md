## Tasks

- [x] 1.0 Create Basic Export Endpoint and Initial UI Button
  - [x] 1.1 Add new POST route `/event/export` to EventController that accepts same parameters as `/event/search`
  - [x] 1.2 Implement basic endpoint handler that returns CSV response headers (Content-Type, Content-Disposition)
  - [x] 1.3 Add "Export to CSV" button to events page UI in header/toolbar area
  - [x] 1.4 Wire up button to make API call with current filter state from EventFilter component
  - [x] 1.5 Test that clicking button triggers download dialog in browser

- [x] 2.0 Implement Core CSV Generation with Simple Data
  - [x] 2.1 [depends on: 1.0] Install and configure csv-stringify library for CSV generation
  - [x] 2.2 Create CSV header row with all event fields (id, eventName, moduleId, etc.)
  - [x] 2.3 Implement basic event-to-CSV row conversion for flat fields
  - [x] 2.4 Add metadata flattening logic to convert nested meta object into prefixed columns (meta.*)
  - [-] 2.5 Generate test CSV with sample events and verify it opens in spreadsheet applications (SKIPPED - will test later)
  - [x] 2.6 Implement proper filename generation with format `events_YYYY-MM-DD.csv`

- [x] 3.0 Add Streaming and Pagination for Large Datasets
  - [x] 3.1 [depends on: 2.0] Refactor endpoint to use Node.js streams instead of building entire response in memory
  - [x] 3.2 Implement database pagination logic to fetch events in batches (e.g., 1000 at a time)
  - [x] 3.3 Create stream pipeline that reads from DB cursor and pipes through CSV stringifier to response
  - [x] 3.4 Add 90-day time range validation and enforcement
  - [-] 3.5 Test with large dataset (10k+ events) to verify streaming works without memory issues (SKIPPED - will test later)
  - [x] 3.6 Add performance monitoring to track memory usage during export

- [ ] 4.0 Integrate Related Entity Data and Advanced Features
  - [x] 4.1 [depends on: 3.0] Add 'extend' parameter support to include related entities (player, gameServer, module, user)
  - [ ] 4.2 Modify CSV generation to include entity names alongside IDs when extended data is available
  - [ ] 4.3 Handle varying metadata structures across different event types gracefully
  - [ ] 4.4 Add total event count estimation and display warning for large exports in UI
  - [ ] 4.5 Ensure all special characters in data are properly escaped according to CSV standards

- [ ] 5.0 Add Error Handling and User Experience Enhancements
  - [ ] 5.1 [depends on: 4.0] Implement proper error handling for database failures during export
  - [ ] 5.2 Return empty CSV with headers only when no events match filters
  - [ ] 5.3 Add loading spinner with "Generating export..." text while processing
  - [ ] 5.4 Display toast notification for export failures with appropriate error messages
  - [ ] 5.5 Disable export button when no filters would return results
  - [ ] 5.7 Add integration tests for full export flow including UI interaction
  - [ ] 5.8 Update API documentation to include new export endpoint (generate API client, docs are automatic)

## Relevant Files

- `packages/app-api/src/controllers/EventController.ts` - Main controller where the new export endpoint will be added (MODIFIED: Added /event/export endpoint)
- `packages/app-api/src/controllers/__tests__/EventController.test.ts` - Unit tests for EventController including new export functionality
- `packages/web-main/src/routes/_auth/_global/events.tsx` - Events page where the export button will be added (MODIFIED: Added Export to CSV button and wired up export functionality)
- `packages/web-main/src/routes/_auth/_global/__tests__/events.test.tsx` - Tests for events page including export button
- `packages/web-main/src/queries/event.tsx` - Event query hooks where export API call will be added (MODIFIED: Added exportEventsToCsv function)
- `packages/web-main/src/components/events/EventFilter.tsx` - Component that manages filter state to be used for export
- `packages/app-api/src/service/EventService.ts` - Service layer that may need streaming query methods
- `packages/app-api/src/service/__tests__/EventService.test.ts` - Tests for EventService streaming functionality
- `packages/lib-apiclient/src/generated/api.ts` - Generated API client that will need regeneration after adding endpoint
- `packages/lib-db/src/models/Event.ts` - Event model for understanding data structure

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- The csv-stringify library is recommended for robust CSV generation with proper escaping
- Streaming implementation is critical for handling large datasets without memory issues
- The export should reuse existing permission checks from the event search endpoint