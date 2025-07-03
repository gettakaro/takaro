# Product Requirements Document: Events Page Rewrite

## Introduction/Overview

The current events page in Takaro suffers from several critical issues that hinder server administrators' ability to effectively monitor and investigate game server activities. This PRD outlines requirements for a complete rewrite of the events page to create a more powerful, intuitive, and information-rich interface.

**Problem Statement**: Server admins struggle with the current events page due to:
- Limited information display requiring multiple clicks to see basic event details
- Poor filtering UI that makes it difficult to quickly narrow down events
- Buggy behavior affecting reliability
- Oversimplified design that doesn't support complex investigation workflows

**Goal**: Create a robust events monitoring and investigation tool that enables server admins to quickly understand what's happening on their game servers and efficiently investigate specific players or incidents.

## Goals

1. **Improve Information Density**: Display 50% more relevant information per event without requiring additional clicks
2. **Enhance Filtering Speed**: Reduce time to apply complex filters from current ~10 seconds to under 3 seconds
3. **Increase Reliability**: Eliminate current bugs and provide 99.9% uptime for event viewing
4. **Support Investigation Workflows**: Enable admins to investigate suspicious player behavior in under 5 clicks
5. **Improve Page Performance**: Load and render 1000+ events smoothly without lag

## User Stories

1. **As a server admin**, I want to see a comprehensive overview of recent events at a glance, so that I can quickly understand what's happening on my servers without clicking into each event.

2. **As a server admin**, I want to quickly filter events by multiple criteria simultaneously, so that I can investigate specific incidents or patterns efficiently.

3. **As a server admin**, I want to see all relevant context for each event (player info, server, module, timestamps, etc.), so that I don't need to open multiple pages to understand what happened.

4. **As a server admin**, I want to easily investigate a specific player's activity history, so that I can identify suspicious behavior patterns.

5. **As a server admin**, I want to view event data in raw JSON format, so that I can see all available data fields and debug issues.

6. **As a server admin**, I want the events page to load quickly and remain responsive even with thousands of events, so that I can work efficiently during critical situations.

## Functional Requirements

### Event Display Requirements

1. **FR1**: The system must display events in a timeline format with the following information visible without clicking:
   - Event type/name with icon indicators (instead of colors)
   - Timestamp (both relative and absolute on hover)
   - Primary actor (player/user who triggered the event) with avatar when available
   - Game server name
   - Module name (if applicable)
   - Key event-specific data (e.g., chat message content, command arguments, currency amounts)
   - Quick action buttons (view details, view raw JSON)

2. **FR2**: The system must group related events visually when they occur in rapid succession from the same player within a 30-second window

3. **FR3**: The system must support expandable rows to show additional metadata without navigating away

4. **FR4**: The system must provide a "Raw JSON" view option for each event to display the complete event data structure with copy-to-clipboard functionality

### Filtering and Search Requirements

5. **FR5**: The system must provide a persistent filter bar with the following capabilities:
   - Multi-select for players with search
   - Multi-select for game servers
   - Multi-select for modules
   - Multi-select for event types with grouping
   - Date/time range picker with presets (Last hour, Last 24h, Last week, Custom)
   - Text search across event metadata
   - Quick filter presets

6. **FR6**: The system must apply filters by fetching filtered results from the server API

7. **FR7**: The system must display active filters clearly with one-click removal

8. **FR8**: The system must support complex filter combinations with AND/OR logic

### Performance Requirements

9. **FR9**: The system must implement virtual scrolling for smooth rendering of 1000+ events

10. **FR10**: The system must load initial page with first 50 events in under 2 seconds

11. **FR11**: The system must support infinite scroll pagination

12. **FR12**: The system must handle API rate limits gracefully with appropriate user messaging

### Investigation Features

13. **FR13**: The system must allow filtering by specific players using the player filter in the filter bar

14. **FR14**: The system must allow viewing all events from the same session/connection

15. **FR15**: The system must support event timeline visualization for selected filters

16. **FR16**: The system must highlight patterns in event data (e.g., repeated failed commands)

### Sharing and Data Access

17. **FR17**: The system must store all filter states in URL parameters for shareable links

18. **FR18**: The system must support copying event details to clipboard in formatted text

19. **FR19**: The system must provide raw JSON view for each event with copy-to-clipboard functionality

### UI/UX Requirements

20. **FR20**: The system must provide clear visual feedback during data loading

21. **FR21**: The system must show loading states and error messages clearly

22. **FR22**: The system must remember user's column preferences and filter settings

23. **FR23**: The system must use consistent iconography to represent different event types

## Non-Goals (Out of Scope)

1. **Real-time event streaming** - Users will use manual refresh for now
2. **Event editing or deletion** - This is an audit log, events are immutable
3. **Custom event type creation** - Only system-defined events
4. **Mobile-specific UI** - Desktop-first design only
5. **Export functionality** - Not included in this phase
6. **Webhook or notification configuration** - Separate feature
7. **Event replay or simulation** - View only, no replay functionality
8. **Keyboard shortcuts** - Can be added in future iterations

## Design Considerations

### Visual Design
- Use data table pattern similar to other admin panels in the system
- Use icons to differentiate event types (avoiding color-only indicators)
- Display player avatars when available for player-related events
- Use consistent iconography from existing icon set
- Ensure sufficient contrast for readability with lots of data
- Sticky header with filters always visible while scrolling

### Component Architecture
- Reuse existing Takaro UI components (DataTable, MultiSelect, DateRangePicker)
- Follow existing patterns for loading states and error handling
- Maintain consistency with current admin panel navigation

### Responsive Behavior
- Minimum supported width: 1280px
- Columns should be hideable/showable based on user preference
- Horizontal scroll for table if needed on smaller screens

### Quick Filter Presets
Consider including these standard quick filters:
- "Recent Activity" (Last hour)
- "Today's Events" (Last 24 hours)
- "Failed Commands" (Event type: command_failed)
- "Player Connections" (Event types: player_connected, player_disconnected)
- "Economic Activity" (Module: economy)

## Technical Considerations

### API Integration
- Utilize existing `/event/search` endpoint with all available filters
- Implement proper pagination using cursor-based approach
- All filtering done server-side (no client-side filtering)
- Use the `extend` parameter to fetch related entity data in single request

### State Management
- Store filter state in URL parameters for shareable links
- Use React Query for data fetching and caching
- Implement optimistic UI updates for filter changes

### Performance Optimizations
- Implement virtual scrolling using existing library
- Debounce filter inputs to avoid excessive API calls
- Use memo and callbacks to prevent unnecessary re-renders
- Lazy load event details only when expanded
- Implement infinite scroll with proper cleanup of old DOM nodes

### Browser Compatibility
- Support latest versions of Chrome, Firefox, Safari, Edge
- Ensure smooth scrolling performance across browsers
- Use browser's native time formatting

## Success Metrics

1. **Page Load Time**: Initial load under 2 seconds for first 50 events
2. **Filter Application Time**: Complex filters applied in under 3 seconds
3. **User Satisfaction**: 80%+ positive feedback from server admins in surveys
4. **Investigation Efficiency**: Average time to investigate player reduced by 60%
5. **Bug Reports**: Zero critical bugs reported in first month after launch
6. **Adoption Rate**: 90% of active server admins using new events page within 2 weeks
7. **Performance**: Smooth scrolling with 1000+ events loaded (60 FPS)

## Wireframe Mockup

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ TAKARO ADMIN - EVENTS                                                      [Refresh] [Share] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ FILTERS                                                              [Clear] [Save]   │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ Players:     [▼ Select players...]          Servers: [▼ Select servers...]          │ │
│ │ Modules:     [▼ Select modules...]          Events:  [▼ Select event types...]      │ │
│ │ Date Range:  [Last 24h ▼] [From: ____] [To: ____]    Search: [_________________]    │ │
│ │                                                                                       │ │
│ │ Quick: [Recent Activity] [Today] [Failed Commands] [Connections] [Economic]          │ │
│ │                                                                                       │ │
│ │ Active: [×Player: John] [×Server: EU-1] [×Module: Economy] [×Last 24h]              │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Showing 127 events                                                      [Load More ↓] │ │
│ ├────┬──────────────┬────────────┬──────────┬──────────┬──────────────────────┬──────┤ │
│ │ ▼  │ Time         │ Player     │ Server   │ Module   │ Event                │ Acts │ │
│ ├────┼──────────────┼────────────┼──────────┼──────────┼──────────────────────┼──────┤ │
│ │ 💰 │ 2 min ago    │ [◉]Alice123│ US-West  │ Economy  │ CURRENCY_ADDED       │ [👁] │ │
│ │    │ 14:23:45     │            │          │          │ Amount: +500 coins   │ [{}] │ │
│ ├────┼──────────────┼────────────┼──────────┼──────────┼──────────────────────┼──────┤ │
│ │ 💬 │ 5 min ago    │ [◉]BobGamer│ US-West  │ Chat     │ CHAT_MESSAGE         │ [👁] │ │
│ │    │ 14:20:12     │            │          │          │ "Need help at base"  │ [{}] │ │
│ ├────┼──────────────┼────────────┼──────────┼──────────┼──────────────────────┼──────┤ │
│ │ ⚠️  │ 8 min ago    │ [◉]Hacker99│ EU-1     │ Commands │ COMMAND_EXECUTED     │ [👁] │ │
│ │ ▼  │ 14:17:33     │            │          │          │ /give @a diamond 64  │ [{}] │ │
│ │    ├──────────────────────────────────────────────────────────────────────────────┤ │
│ │    │ Additional Details:                                                           │ │
│ │    │ • Command Status: FAILED - Insufficient permissions                          │ │
│ │    │ • IP Address: 192.168.1.42                                                   │ │
│ │    │ • Session ID: abc-123-def                                                    │ │
│ │    └──────────────────────────────────────────────────────────────────────────────┘ │
│ ├────┼──────────────┼────────────┼──────────┼──────────┼──────────────────────┼──────┤ │
│ │ 🛒 │ 12 min ago   │ [◉]Charlie │ EU-1     │ Shop     │ ITEM_BOUGHT          │ [👁] │ │
│ │    │ 14:13:21     │            │          │          │ Iron Sword x1 (50g)  │ [{}] │ │
│ ├────┼──────────────┼────────────┼──────────┼──────────┼──────────────────────┼──────┤ │
│ │ ┌─ Grouped Events (3) ───────────────────────────────────────────────────────────┐ │ │
│ │ │🔄│ 15 min ago   │ [◉]David456│ US-East  │ Teleport │ TELEPORT_USED (3x)   │ [👁] │ │
│ │ │  │ 14:10:00     │            │          │          │ Multiple TPs         │ [{}] │ │
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ │ │
│ ├────┼──────────────┼────────────┼──────────┼──────────┼──────────────────────┼──────┤ │
│ │ 🏪 │ 18 min ago   │ [◉]Emma789 │ US-East  │ Economy  │ SHOP_CREATED         │ [👁] │ │
│ │    │ 14:07:15     │            │          │          │ "Emma's Emporium"    │ [{}] │ │
│ └────┴──────────────┴────────────┴──────────┴──────────┴──────────────────────┴──────┘ │
│                                                                                           │
│ Icons: 💰 Economy  💬 Chat  ⚠️ Error/Failed  🛒 Shop  🔄 Movement  🏪 Creation            │
│ Actions: [👁] View Details  [{}] View Raw JSON     [◉] = Player Avatar                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Features Visualized:

1. **Persistent Filter Bar** - Multi-select dropdowns for players, servers, modules, and event types with date range picker and search
2. **Quick Filter Presets** - One-click access to common filter combinations
3. **Active Filters Display** - Shows applied filters as removable chips
4. **Information-Dense Table** - Shows all key information without clicking, including event-specific data
5. **Visual Indicators** - Icons for different event types, player avatars where applicable
6. **Expandable Rows** - Shown with the "Hacker99" row expanded to display additional metadata
7. **Event Grouping** - Related events grouped together (David456's multiple teleports)
8. **Quick Actions** - View details and raw JSON buttons for each event
9. **Infinite Scroll** - Load more button/trigger at bottom of list
10. **Share Button** - Copies current URL with all filter parameters