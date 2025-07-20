# Requirements Document

## Introduction

This feature creates a public-facing ban lookup system that allows users to search for banned players across all Takaro domains without authentication. The system consists of two new public API endpoints and a dedicated frontend application (web-bans) that provides a clean interface for searching ban information and viewing global ban statistics.

## Requirements

### Requirement 1

**User Story:** As a game server administrator or community member, I want to search for banned players by their gaming platform ID (Steam, EOS, Xbox, etc.), so that I can verify if a player has been banned across the Takaro network.

#### Acceptance Criteria

1. WHEN a user enters a valid gaming platform ID THEN the system SHALL return all ban records for that player across all domains
2. WHEN displaying ban results THEN the system SHALL show the ban reason, number of servers affected, ban date, and domain information
3. WHEN a user searches for a non-existent or unbanned player ID THEN the system SHALL return an appropriate "no bans found" message
4. WHEN a user performs a search THEN the system SHALL apply rate limiting to prevent abuse
5. IF the search query is invalid or malformed THEN the system SHALL return a clear error message

### Requirement 2

**User Story:** As a community member, I want to view global ban statistics, so that I can understand the overall moderation activity across the Takaro network.

#### Acceptance Criteria

1. WHEN a user requests global ban statistics THEN the system SHALL return total number of bans, bans per week, and other relevant metrics
2. WHEN the statistics endpoint is called THEN the system SHALL serve cached data with a 1-hour cache period to optimize performance
3. WHEN displaying statistics THEN the system SHALL show data in an easily readable format with appropriate visualizations
4. WHEN the cache expires THEN the system SHALL refresh the statistics data from the database

### Requirement 3

**User Story:** As a developer, I want the ban lookup endpoints to be publicly accessible without authentication, so that the information can be easily integrated into community tools and websites.

#### Acceptance Criteria

1. WHEN accessing the ban search endpoint THEN the system SHALL NOT require authentication
2. WHEN accessing the global statistics endpoint THEN the system SHALL NOT require authentication
3. WHEN implementing public endpoints THEN the system SHALL include appropriate rate limiting to prevent abuse
4. WHEN designing the API THEN the system SHALL follow RESTful conventions and return JSON responses

### Requirement 4

**User Story:** As a user of the ban lookup frontend, I want a clean and intuitive interface, so that I can easily search for ban information and view statistics.

#### Acceptance Criteria

##### Search Interface

1. WHEN using the web-bans frontend THEN the system SHALL provide a search interface with:

   - A prominent search input field with placeholder text "Enter player ID (Steam ID, EOS ID, Xbox ID, etc.)"
   - Real-time format validation that shows errors for invalid ID formats
   - A platform selector dropdown (optional) to filter by Steam, EOS, Xbox, PlayStation, or All Platforms
   - A search button that shows loading state during searches
   - Auto-focus on the search field when the page loads

2. WHEN entering a player ID THEN the system SHALL:

   - Validate the format based on the selected platform (if any)
   - Show inline validation errors immediately (e.g., "Invalid Steam ID format")
   - Support pasting IDs from clipboard
   - Trim whitespace automatically
   - Debounce validation by 300ms to avoid excessive checks

3. WHEN searching for a player THEN the system SHALL:
   - Disable the form and show a loading spinner on the search button
   - Display "Searching..." text or a skeleton loader
   - Handle network errors gracefully with retry options
   - Show rate limit errors with a countdown timer until next allowed request

##### Results Display

4. WHEN displaying search results THEN the system SHALL use components from lib-components:

   - `Player` component for player information display
   - `Card` components for individual ban records
   - `Chip` components for ban status (Active/Expired)
   - `DateFormatter` for consistent date display
   - `CopyId` component for player IDs with external profile links
   - `Empty` component when no bans are found

5. WHEN showing ban information THEN the system SHALL display data in a clear, organized manner:

   - Group bans by domain with domain name prominently displayed
   - Show number of affected servers per domain
   - Display ban reason with appropriate severity coloring
   - Show ban duration (temporary) or "Permanent" label
   - Include ban creation date and expiration date (if applicable)
   - Sort bans by most recent first
   - Collapse older bans with option to expand

6. WHEN no bans are found THEN the system SHALL:
   - Display a clear "No bans found" message using the `Empty` component
   - Suggest checking the player ID format
   - Provide option to try a different search
   - Include helpful text about what platforms are supported

##### Statistics Dashboard

7. WHEN viewing global statistics THEN the system SHALL present data with:

   - Summary cards using `Stats` component showing:
     - Total bans (all-time)
     - Currently active bans
     - Bans this week
     - Bans this month
   - Interactive charts using lib-components chart library:
     - Line chart for ban trends over time (last 30 days)
   - Loading skeletons while data fetches
   - Last updated timestamp
   - Auto-refresh every hour (matching cache duration)

8. WHEN interacting with charts THEN the system SHALL:
   - Show tooltips on hover with detailed information
   - Allow clicking on legend items to show/hide data series
   - Provide zoom and pan capabilities on time-series charts
   - Export chart data as CSV (optional)

##### Navigation and Layout

9. WHEN navigating the application THEN the system SHALL:

   - Provide a consistent header with "Takaro Ban Lookup" branding
   - Include navigation between Search and Statistics views
   - Show breadcrumbs when viewing search results
   - Maintain search query in URL parameters for shareable links
   - Provide a "New Search" button when viewing results

10. WHEN the frontend loads THEN the system SHALL be responsive:
    - Desktop (≥1024px): Two-column layout for search and quick stats
    - Tablet (768px-1023px): Single column with side-by-side elements where appropriate
    - Mobile (<768px): Single column, touch-optimized interface
    - Ensure all interactive elements have 44px minimum touch target
    - Use responsive typography that scales appropriately

##### Accessibility

11. WHEN using the interface THEN the system SHALL meet WCAG 2.1 AA standards:
    - All interactive elements have proper ARIA labels
    - Color contrast ratio of at least 4.5:1 for normal text
    - Keyboard navigation support for all functions
    - Screen reader announcements for dynamic content changes
    - Focus indicators visible on all interactive elements
    - Error messages associated with form fields via ARIA

##### Performance

12. WHEN loading the application THEN the system SHALL:
    - Display initial content within 3 seconds on 3G connection
    - Use code splitting to load statistics components on demand
    - Implement progressive enhancement for chart visualizations
    - Cache static assets with appropriate headers
    - Lazy load images and non-critical components

##### Error Handling

13. WHEN errors occur THEN the system SHALL:
    - Display user-friendly error messages without technical details
    - Provide specific guidance for common errors:
      - "Player ID not found" → "Check the ID and try again"
      - "Rate limit exceeded" → Show countdown timer
      - "Network error" → "Check your connection and retry"
    - Log detailed errors to console for debugging
    - Never show raw API error responses to users

### Requirement 5

**User Story:** As a system administrator, I want the ban lookup system to handle high traffic efficiently, so that the public endpoints remain responsive under load.

#### Acceptance Criteria

1. WHEN the search endpoint receives requests THEN the system SHALL implement rate limiting per IP address
2. WHEN serving global statistics THEN the system SHALL use Redis caching with 1-hour expiration
3. WHEN database queries are executed THEN the system SHALL be optimized for performance
4. WHEN the system experiences high load THEN the system SHALL maintain reasonable response times
5. IF rate limits are exceeded THEN the system SHALL return appropriate HTTP status codes and error messages
