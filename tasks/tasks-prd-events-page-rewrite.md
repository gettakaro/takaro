## Tasks

- [x] 1.0 Set up new events page structure and prepare for migration
  - [x] 1.1 Create new events route file at temporary location (events-new.tsx) to avoid conflicts
  - [x] 1.2 Set up basic page layout with header and scrollable timeline container
  - [x] 1.3 Create placeholder data structure for timeline events matching EventOutputDTO
  - [x] 1.4 Implement basic styling following Takaro design system theme
  - [x] 1.5 Set up route configuration for testing the new page

- [x] 2.0 Refactor EventFeed and EventItem into Timeline components
  - [x] 2.1 [depends on: 1.0] Refactor EventFeed component into Timeline component with vertical line styling
  - [x] 2.2 [depends on: 2.1] Refactor EventItem into TimelineItem with compact, information-dense layout
  - [x] 2.3 [depends on: 2.2] Preserve all 20+ event type renderings in the new TimelineItem
  - [x] 2.4 [depends on: 2.3] Add event type icons using existing icon mappings
  - [ ] 2.5 [depends on: 2.3] Integrate Avatar component for player avatars
  - [x] 2.6 [depends on: 2.3] Implement compact timestamp display with Luxon
  - [x] 2.7 [depends on: 2.1] Update all imports of EventFeed/EventItem across the codebase

- [x] 3.0 Migrate and enhance filtering functionality
  - [x] 3.1 [depends on: 2.0] Integrate existing EventFilter component with new layout
  - [x] 3.2 [depends on: 3.1] Add quick filter preset buttons above EventFilter
  - [x] 3.3 [depends on: 3.1] Ensure all filter states sync to URL using existing patterns
  - [x] 3.4 [depends on: 3.3] Implement active filters chip display with removal
  - [x] 3.5 [depends on: 3.3] Update API calls to use filter parameters properly

- [x] 4.0 Implement interactive features
  - [x] 4.1 [depends on: 2.0] Add inline expansion for additional metadata
  - [x] 4.2 [depends on: 4.1] Implement event grouping visualization (30-second window)
  - [x] 4.3 [depends on: 2.0] Create compact raw JSON view using Dialog component
  - [x] 4.5 [depends on: 2.0] Implement inline action buttons matching current EventItem actions
  - [x] 4.6 [depends on: 1.0] Add refresh button maintaining current functionality

- [x] 5.0 Add performance optimizations with virtual scrolling
  - [x] 5.1 [depends on: 2.0] Implement virtual scrolling using react-window (VariableSizeList)
  - [x] 5.2 [depends on: 5.1] Integrate with existing InfiniteScroll component
  - [ ] 5.3 [depends on: 5.2] Implement proper cleanup and memory management
  - [x] 5.4 [depends on: 2.0] Connect to event API using existing eventsInfiniteQueryOptions
  - [x] 5.5 [depends on: 3.0] Add memo and useCallback optimizations
  - [x] 5.6 [depends on: 2.0] Add Skeleton loaders for loading states

- [x] 6.0 Update EventFeedWidget and test all usages
  - [x] 6.1 [depends on: 2.7] Update EventFeedWidget to work with refactored components

- [x] 7.0 Complete migration and polish
  - [x] 7.1 [depends on: 6.0] Replace old events.tsx with new implementation
  - [x] 7.2 [depends on: 7.1] Remove temporary events-new.tsx file
  - [x] 7.3 [depends on: 5.0] Add error boundaries and error handling
  - [x] 7.4 [depends on: 5.0] Implement rate limit handling
  - [x] 7.5 [depends on: 2.0] Add empty state with proper messaging
  - [x] 7.6 [depends on: 3.0] Persist user preferences in localStorage

- [ ] 8.0 Post-Implementation Improvements and Fixes
  - [x] 8.1 [depends on: 7.0] Fix missing useEventGrouping hook implementation with proper TypeScript types
  - [x] 8.2 [depends on: 7.0] Fix missing eventIcons.ts utility mapping event types to icons
  - [ ] 8.3 [depends on: 4.1] Fix chevron icon to properly indicate expanded/collapsed state
  - [ ] 8.4 [depends on: 5.1] Optimize virtual list row height calculations with memoization
  - [ ] 8.5 [depends on: 5.1] Add cleanup for rowHeights ref to prevent memory leaks
  - [ ] 8.6 [depends on: 2.0] Replace all `any` types with proper interfaces for event metadata
  - [ ] 8.7 [depends on: 7.0] Add ARIA labels and improve accessibility for timeline navigation
  - [ ] 8.8 [depends on: 4.1] Implement keyboard shortcuts for expand/collapse functionality
  - [ ] 8.9 [depends on: 4.1] Add smooth CSS transitions for expand/collapse animations
  - [ ] 8.10 [depends on: 7.3] Add error boundaries around individual event rendering
  - [ ] 8.11 [depends on: 7.3] Implement specific error messages for different failure types
  - [ ] 8.12 [depends on: 2.0] Split large components into smaller, focused files
  - [ ] 8.13 [depends on: 2.0] Extract inline styles in Row component to styled components
  - [ ] 8.14 [depends on: 5.6] Improve loading states with proper skeleton screens
  - [ ] 8.15 [depends on: 7.6] Implement comprehensive preference persistence beyond filters
  - [ ] 8.16 [depends on: 2.0] Add tooltips for truncated content in timeline items
  - [ ] 8.17 [depends on: 3.0] Fix missing dependencies in useEffect hooks
  - [ ] 8.18 [depends on: 1.4] Ensure color contrast meets WCAG AA standards
  - [ ] 8.19 [depends on: 4.2] Make grouping window configurable (currently hardcoded 30000ms)
  - [ ] 8.20 [depends on: 5.1] Debounce virtual list height updates for better performance

## Relevant Files

### Route Files
- `packages/web-main/src/routes/_auth/_global/events-new.tsx` - New events page implementation (temporary)
- `packages/web-main/src/routes/_auth/_global/events.tsx` - Current events page to be replaced
- `packages/web-main/src/routes/_auth/_global/events.test.tsx` - Unit tests for events page

### Refactored Event Components
- `packages/web-main/src/components/events/EventFeed/index.tsx` - Refactored into Timeline component
- `packages/web-main/src/components/events/EventFeed/EventItem.tsx` - Refactored into TimelineItem component
- `packages/web-main/src/components/events/EventFeed/style.ts` - Updated styles for timeline
- `packages/web-main/src/components/events/EventFeedWidget.tsx` - Updated to use refactored components

### Files to Update (imports)
- `packages/web-main/src/routes/_auth/gameserver.$gameServerId/dashboard.overview.tsx` - Update EventFeedWidget usage
- `packages/web-main/src/routes/_auth/_global/player.$playerId/events.tsx` - Update EventFeed/EventItem imports
- `packages/web-main/src/routes/_auth/_global/dashboard.tsx` - Update event component imports
- `packages/web-main/src/routes/_auth/-module-builder/ModuleBuilderInner.tsx` - Update event component imports

### Existing Components to Reuse
- `packages/web-main/src/components/events/EventFilter.tsx` - Existing filter component
- `packages/web-main/src/components/events/eventFilterSchema.ts` - Filter validation schema
- `packages/web-main/src/components/dialogs/EventDetailDialog.tsx` - For raw JSON view

### New Supporting Files
- `packages/web-main/src/hooks/useEventGrouping.ts` - Hook for grouping events in 30-second windows (CREATED)
- `packages/web-main/src/hooks/useEventGrouping.test.ts` - Unit tests for event grouping
- `packages/web-main/src/utils/eventIcons.ts` - Mapping of event types to icons (CREATED)
- `packages/web-main/src/utils/eventFormatters.ts` - Event-specific formatting functions (CREATED)

### Notes

- The events page is located in the routes directory following TanStack Router conventions
- Unit tests should be placed alongside the code files they test
- The project uses `react-window` for virtual scrolling (already installed)
- We are directly refactoring EventFeed → Timeline and EventItem → TimelineItem
- All components that import EventFeed/EventItem must be updated
- The design should be compact like an activity feed, not bulky cards
- All filtering is done server-side via the `/event/search` API endpoint
- Manual refresh functionality replaces live updates (as per PRD non-goals)
- The existing EventItem component handles 20+ different event types with custom rendering logic that must be preserved
- Use the existing Takaro design system theme tokens for all styling