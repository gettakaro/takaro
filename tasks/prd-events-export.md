# Product Requirements Document: Events CSV Export

## Introduction/Overview

This feature adds CSV export functionality to the existing events system in Takaro. Users will be able to export filtered event data in CSV format directly to their browser, with the same filtering capabilities available in the event search interface. The system will handle large datasets efficiently through streaming, ensuring that exports with millions of events can be processed without memory constraints.

## Goals

1. Enable users to export event data in CSV format for external analysis and reporting
2. Maintain consistency with existing event search functionality by accepting the same filter parameters
3. Handle large-scale exports (millions of events) efficiently through streaming
4. Provide a seamless user experience with direct browser downloads
5. Ensure proper data formatting by flattening nested JSON structures into CSV columns

## User Stories

1. **As a server administrator**, I want to export event data to CSV so that I can analyze player behavior patterns in external tools like Excel or data analysis software.

2. **As a game analyst**, I want to export filtered events (e.g., all player deaths in the last 30 days) so that I can create reports on game balance and player engagement.

3. **As a compliance officer**, I want to export chat message events so that I can review communications for policy violations in a spreadsheet format.

4. **As a developer**, I want to export error events (failed functions) so that I can analyze patterns and debug issues more effectively.

## Functional Requirements

1. **Export Endpoint**
   - The system must provide a new API endpoint that accepts the same parameters as `/event/search`
   - The endpoint must return data in CSV format instead of JSON
   - The endpoint must require the same `READ_EVENTS` permission as the search endpoint

2. **Data Format**
   - The system must flatten all nested JSON fields into individual CSV columns
   - The system must include column headers in the CSV output
   - The system must use comma (,) as the field delimiter
   - The system must properly escape special characters in CSV format using a CSV library that handles quotes, commas, and other special characters according to CSV standards
   - The system must include all event fields: id, eventName, moduleId, playerId, userId, gameserverId, actingUserId, actingModuleId, meta (flattened), createdAt, updatedAt
   - The system must include related entity data (player names, server names, module names, user names) when available, not just IDs
   - The system must use the 'extend' parameter to automatically include related entities in the export

3. **Frontend Integration**
   - The system must add an "Export" button to the events page UI
   - The button must capture the currently applied filters from the EventFilter component
   - The button must trigger a direct download to the user's browser
   - The button must display a loading spinner while the export is being generated
   - The system must show a warning message when the estimated number of events (based on the total from the first query) indicates a large export
   - The exported file must be named `events_YYYY-MM-DD.csv` where the date is the current date when the export is generated

4. **Performance Requirements**
   - The system must stream results to prevent memory overflow with large datasets
   - The system must paginate through database results internally
   - The system must handle exports of millions of events without crashing
   - The system must enforce a maximum time range of 90 days per export

5. **Error Handling**
   - The system must return an empty CSV file (with headers only) when no events match the filters
   - The system must display a 500 error message if the export fails during processing
   - The system must continue processing even if the export takes a long time (no timeout)

6. **Metadata Handling**
   - The system must flatten the `meta` field into individual columns
   - Column names for metadata must be prefixed with "meta." (e.g., meta.message, meta.command, meta.error)
   - The system must handle varying metadata structures across different event types

## Non-Goals (Out of Scope)

1. This feature will NOT include email delivery of exports
2. This feature will NOT store exported files on the server for later retrieval
3. This feature will NOT include scheduled or automated exports
4. This feature will NOT include export formats other than CSV (no Excel, JSON, etc.)
5. This feature will NOT include data aggregation or summarization (raw events only)
6. This feature will NOT bypass existing permission checks
7. This feature will NOT include progress percentage indicators (only loading spinner)
8. This feature will NOT include rate limiting as exports are user-initiated and not frequent operations

## Design Considerations

1. **UI Placement**
   - The Export button should be placed in the events page header/toolbar area, near other action buttons
   - The button should be clearly labeled "Export to CSV" or similar
   - The button should be disabled when no filters would return results

2. **User Feedback**
   - Display a loading spinner with text like "Generating export..." while processing
   - Show the standard error toast notification if the export fails
   - The browser's native download UI will handle showing download progress

## Technical Considerations

1. **Backend Implementation**
   - Utilize Node.js streams to pipe database results directly to the HTTP response
   - Set appropriate HTTP headers for CSV download (Content-Type, Content-Disposition)
   - Implement database cursor/pagination to fetch results in batches
   - Use a robust CSV library (e.g., csv-stringify) to ensure proper escaping of special characters

2. **Frontend Implementation**
   - Reuse existing filter state from EventFilter component
   - Use the same query parameters structure as the event search
   - Handle the download through native browser behavior (no need for blob handling)
   - Consider using the existing API client infrastructure with response type modifications

3. **Performance Optimizations**
   - Use database indexes effectively (existing indexes on moduleId, createdAt)
   - Consider implementing server-side request queuing if multiple large exports are requested
   - Monitor memory usage during development to ensure streaming is working correctly

## Success Metrics

1. **Functional Success**
   - Users can successfully export events matching their current filters
   - Exports complete successfully for datasets up to 1 million events
   - CSV files open correctly in common spreadsheet applications (Excel, Google Sheets)

2. **Performance Metrics**
   - Export generation begins within 2 seconds of clicking the button
   - Memory usage remains stable during large exports (no memory leaks)
   - Concurrent exports do not crash the server

3. **User Adoption**
   - 25% of users who view the events page use the export feature within first month
   - Support tickets related to "how to export event data" decrease by 80%

