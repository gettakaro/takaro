# Design Document

## Overview

The public ban lookup system consists of two main components:

1. **Backend API Extensions**: Two new public endpoints in the existing Takaro API for ban search and global statistics
2. **Frontend Application**: A new standalone web application (`web-bans`) that provides a clean interface for accessing ban information

The system is designed to be publicly accessible without authentication while maintaining performance through caching and rate limiting.

## Architecture

### Backend Architecture

The backend extends the existing Takaro API with two new public endpoints:

```
/public/bans/search - Player ban lookup endpoint (rate limited)
/public/bans/stats - Global ban statistics endpoint (cached)
```

These endpoints will be implemented as a new `PublicBanController` that operates without domain scoping, allowing cross-domain ban searches.

### Frontend Architecture

The frontend follows the existing Takaro web application patterns:

- **Framework**: React with Vite (matching `web-main`)
- **Styling**: Uses `@takaro/lib-components` for consistent UI
- **API Client**: Generated TypeScript client from OpenAPI spec
- **Routing**: React Router for navigation between search and stats views

## Frontend UI/UX Design

### Visual Design Principles

1. **Consistency**: Follow Takaro's existing design system from lib-components
2. **Clarity**: Information hierarchy with clear visual distinctions
3. **Accessibility**: WCAG 2.1 AA compliant with high contrast and clear typography
4. **Performance**: Progressive enhancement with fast initial load

### Page Layouts

#### Landing Page (/)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    Header                                │  │
│  │  [Takaro Logo] Takaro Ban Lookup                        │  │
│  │  Public ban search across all Takaro domains            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 Search Section                           │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ 🔍 Enter player ID (Steam ID, EOS ID, etc.)    │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  Platform: [All Platforms ▼]    [Search Player]        │  │
│  │                                                          │  │
│  │  Examples: 76561198..., 0002ffd..., xbl:2535...       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Quick Statistics                            │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┐        │  │
│  │  │Total Bans│Active    │This Week │This Month│        │  │
│  │  │  12,453  │  8,234   │   342    │  1,205   │        │  │
│  │  └──────────┴──────────┴──────────┴──────────┘        │  │
│  │                                                          │  │
│  │              [View Full Statistics →]                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    Footer                               │  │
│  │  Powered by Takaro | API Documentation | Privacy       │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### Search Results Page (/search?id=...&platform=...)

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (same as landing)                                       │
├─────────────────────────────────────────────────────────────────┤
│  ← Back to Search                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │               Player Information                         │  │
│  │  ┌────┐                                                 │  │
│  │  │ 👤 │  PlayerName123                                 │  │
│  │  └────┘  Steam • 76561198000000000 [Copy] [View ↗]    │  │
│  │          Status: 3 Active Bans                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Ban Records (3)                          Filter: [All ▼]      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🚫 ACTIVE • example-gaming.com                          │  │
│  │                                                          │  │
│  │ Reason: Cheating - Aimbot detected                      │  │
│  │ Servers: 5 servers affected                             │  │
│  │ Banned: Jan 15, 2024 (2 days ago)                      │  │
│  │ Expires: Never (Permanent ban)                          │  │
│  │                                                          │  │
│  │ [▼ Show affected servers]                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ⏰ TEMPORARY • another-network.net                      │  │
│  │                                                          │  │
│  │ Reason: Toxic behavior - Harassment                     │  │
│  │ Servers: 2 servers affected                             │  │
│  │ Banned: Jan 10, 2024 (7 days ago)                      │  │
│  │ Expires: Feb 10, 2024 (in 24 days)                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [New Search]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Statistics Dashboard (/statistics)

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (same as landing)                                       │
├─────────────────────────────────────────────────────────────────┤
│  ← Back to Search                    Last updated: 2 mins ago  │
│                                                                 │
│  Global Ban Statistics                                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────┬──────────────┬──────────────┐        │  │
│  │  │ Total Bans   │ Active Bans  │ Expired Bans │        │  │
│  │  │   12,453     │    8,234     │    4,219     │        │  │
│  │  └──────────────┴──────────────┴──────────────┘        │  │
│  │                                                          │  │
│  │  ┌──────────────┬──────────────┬──────────────┐        │  │
│  │  │ This Week    │ This Month   │ This Year    │        │  │
│  │  │     342      │    1,205     │    12,453    │        │  │
│  │  └──────────────┴──────────────┴──────────────┘        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                Ban Trends (Last 30 Days)               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │     📈 Line chart showing daily ban counts      │  │  │
│  │  │                                                  │  │  │
│  │  │  60 ┤                                    ╱╲      │  │  │
│  │  │  40 ┤                              ╱╲___╱  ╲     │  │  │
│  │  │  20 ┤ ____╱╲____╱╲________╱╲____╱           │  │  │
│  │  │   0 └────────────────────────────────────────   │  │  │
│  │  │      Dec 18        Jan 1          Jan 17        │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
web-bans/
├── App.tsx
├── layouts/
│   └── PublicLayout.tsx (header, footer, container)
├── pages/
│   ├── LandingPage.tsx
│   ├── SearchResultsPage.tsx
│   └── StatisticsPage.tsx
├── components/
│   ├── search/
│   │   ├── PlayerSearchForm.tsx
│   │   ├── PlatformSelector.tsx
│   │   └── SearchExamples.tsx
│   ├── results/
│   │   ├── PlayerInfoCard.tsx
│   │   ├── BanRecordCard.tsx
│   │   ├── BanFilters.tsx
│   │   └── NoResultsMessage.tsx
│   ├── stats/
│   │   ├── StatsSummary.tsx
│   │   └── BanTrendsChart.tsx
│   └── common/
│       ├── LoadingState.tsx
│       ├── ErrorMessage.tsx
│       └── RateLimitMessage.tsx
└── hooks/
    ├── useBanSearch.ts
    ├── useBanStats.ts
    └── useRateLimit.ts
```

### Interaction Flows

#### Search Flow

```
Landing Page
    ↓
User enters player ID
    ↓
Platform selection (optional)
    ↓
Click Search
    ↓
Loading state
    ↓
Results Page OR Error State
    ↓
View ban details / New search
```

#### Statistics Flow

```
Landing Page
    ↓
Click "View Full Statistics"
    ↓
Statistics Dashboard
    ↓
Interactive charts
    ↓
Auto-refresh (1 hour)
```

### State Management

```typescript
// Application State Structure
interface AppState {
  search: {
    query: string;
    platform: PlatformType | 'all';
    isSearching: boolean;
    results: BanSearchResult | null;
    error: Error | null;
  };
  statistics: {
    data: GlobalBanStats | null;
    isLoading: boolean;
    lastUpdated: Date | null;
    error: Error | null;
  };
  rateLimit: {
    remaining: number;
    resetTime: Date | null;
  };
}
```

### Theme and Styling

```typescript
// Theme extensions for ban lookup
const banLookupTheme = {
  colors: {
    ban: {
      active: '#ef4444', // red-500
      expired: '#6b7280', // gray-500
      temporary: '#f59e0b', // amber-500
      permanent: '#dc2626', // red-600
    },
    platform: {
      steam: '#1b2838',
      eos: '#0078d4',
      xbox: '#107c10',
      playstation: '#003791',
    },
  },
  components: {
    banCard: {
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
  },
};
```

### Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: '0px', // < 768px
  tablet: '768px', // 768px - 1023px
  desktop: '1024px', // ≥ 1024px
};

// Example responsive component
const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${breakpoints.tablet}) {
    flex-direction: row;
    align-items: flex-end;
  }
`;
```

### Accessibility Features

1. **Keyboard Navigation**

   - Tab order: Search → Platform → Submit → Results
   - Enter key submits search form
   - Escape key clears search field

2. **Screen Reader Support**

   - ARIA labels on all interactive elements
   - Live regions for search results
   - Descriptive link text

3. **Visual Accessibility**
   - High contrast mode support
   - Focus indicators on all interactive elements
   - No reliance on color alone for information

### Animation and Transitions

```css
/* Smooth transitions for state changes */
.ban-card {
  transition: all 0.2s ease-in-out;
}

.ban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Loading skeleton animation */
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

/* Chart animations */
.chart-enter {
  opacity: 0;
  transform: scale(0.95);
}

.chart-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 300ms ease-out;
}
```

## Components and Interfaces

### Backend Components

#### PublicBanController

```typescript
@JsonController('/public/bans')
export class PublicBanController {
  @Post('/search')
  @UseBefore(rateLimitMiddleware)
  async searchBans(@Body() query: PublicBanSearchDTO): Promise<PublicBanSearchResultDTO>

  @Get('/stats')
  async getGlobalStats(): Promise<GlobalBanStatsDTO>
}
```

#### PublicBanService

```typescript
export class PublicBanService {
  constructor(
    private settingsService: SettingsService,
    private banService: BanService
  ) {}

  async searchBansAcrossDomains(playerId: string, platformType: string): Promise<BanSearchResult[]> {
    // Query will filter based on shareBanInfoGlobally setting
    // Uses the SQL queries defined above with settings table join
  }

  async getGlobalBanStatistics(): Promise<GlobalBanStats> {
    // Aggregates statistics only from domains with shareBanInfoGlobally = 'true'
    // Uses the SQL queries defined above with settings table join
  }
}
```

#### Rate Limiting Configuration

- **Search Endpoint**: 10 requests per minute per IP
- **Stats Endpoint**: No rate limiting (cached response)

#### Caching Strategy

- **Redis Key**: `public:ban:stats`
- **TTL**: 3600 seconds (1 hour)
- **Cache Invalidation**: Time-based expiration only

### Frontend Components

#### Core Pages

##### LandingPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { styled, Stats, Card } from '@takaro/lib-components';
import { PlayerSearchForm } from '../components/search/PlayerSearchForm';
import { useBanStats } from '../hooks/useBanStats';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[4]};
`;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useBanStats({ summary: true });

  const handleSearch = (playerId: string, platform: string) => {
    navigate({
      to: '/search',
      search: { id: playerId, platform }
    });
  };

  return (
    <Container>
      <PlayerSearchForm onSearch={handleSearch} />
      <QuickStats stats={stats} isLoading={isLoading} />
    </Container>
  );
};
```

##### SearchResultsPage.tsx

```typescript
import { useSearch } from '@tanstack/react-router';
import { styled, Button, Empty, Spinner } from '@takaro/lib-components';
import { PlayerInfoCard } from '../components/results/PlayerInfoCard';
import { BanRecordCard } from '../components/results/BanRecordCard';
import { useBanSearch } from '../hooks/useBanSearch';

export const SearchResultsPage: React.FC = () => {
  const { id, platform } = useSearch({ from: '/search' });
  const { data, isLoading, error } = useBanSearch(id, platform);

  if (isLoading) return <Spinner size="large" />;
  if (error) return <ErrorMessage error={error} />;
  if (!data || data.bans.length === 0) {
    return (
      <Empty
        title="No bans found"
        description="This player has no ban records in our system"
        actions={<Button onClick={() => navigate('/')}>New Search</Button>}
      />
    );
  }

  return (
    <Container>
      <PlayerInfoCard player={data} />
      <BansList>
        {data.bans.map((ban) => (
          <BanRecordCard key={ban.id} ban={ban} />
        ))}
      </BansList>
    </Container>
  );
};
```

##### StatisticsPage.tsx

```typescript
import { styled, Card } from '@takaro/lib-components';
import { StatsSummary } from '../components/stats/StatsSummary';
import { BanTrendsChart } from '../components/stats/BanTrendsChart';
import { useBanStats } from '../hooks/useBanStats';

export const StatisticsPage: React.FC = () => {
  const { data, isLoading, lastUpdated } = useBanStats({ detailed: true });

  return (
    <Container>
      <Header>
        <h1>Global Ban Statistics</h1>
        {lastUpdated && <LastUpdated>Last updated: {formatTime(lastUpdated)}</LastUpdated>}
      </Header>

      <StatsSummary data={data} isLoading={isLoading} />

      <ChartsGrid>
        <Card>
          <CardTitle>Ban Trends (Last 30 Days)</CardTitle>
          <BanTrendsChart data={data?.banTrends} isLoading={isLoading} />
        </Card>

      </ChartsGrid>
    </Container>
  );
};
```

#### Reusable Components

##### PlayerSearchForm.tsx

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { styled, TextField, SelectField, Button, FormError } from '@takaro/lib-components';
import { validatePlayerId } from '../../utils/validation';

interface SearchFormData {
  playerId: string;
  platform: string;
}

interface Props {
  onSearch: (playerId: string, platform: string) => void;
  initialValues?: Partial<SearchFormData>;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

export const PlayerSearchForm: React.FC<Props> = ({ onSearch, initialValues }) => {
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SearchFormData>({
    defaultValues: {
      playerId: initialValues?.playerId || '',
      platform: initialValues?.platform || 'all'
    }
  });

  const platform = watch('platform');

  const onSubmit = (data: SearchFormData) => {
    onSearch(data.playerId.trim(), data.platform);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        control={control}
        name="playerId"
        label="Player ID"
        placeholder="Enter player ID (Steam ID, EOS ID, etc.)"
        required
        rules={{
          required: 'Player ID is required',
          validate: (value) => validatePlayerId(value, platform) || 'Invalid ID format'
        }}
        autoFocus
      />

      <SelectField
        control={control}
        name="platform"
        label="Platform (optional)"
        options={[
          { value: 'all', label: 'All Platforms' },
          { value: 'steam', label: 'Steam' },
          { value: 'eos', label: 'Epic Online Services' },
          { value: 'xbox', label: 'Xbox' },
          { value: 'playstation', label: 'PlayStation' }
        ]}
      />

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={!watch('playerId')}
      >
        Search Player
      </Button>
    </Form>
  );
};
```

##### BanRecordCard.tsx

```typescript
import { useState } from 'react';
import { styled, Card, Chip, DateFormatter, Collapsible, Button } from '@takaro/lib-components';
import { BanInfo } from '../../types';

interface Props {
  ban: BanInfo;
}

const BanCard = styled(Card)<{ $isActive: boolean }>`
  border-left: 4px solid ${({ theme, $isActive }) =>
    $isActive ? theme.colors.error : theme.colors.backgroundAccent};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.elevation.medium};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const BanDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const BanRecordCard: React.FC<Props> = ({ ban }) => {
  const [showServers, setShowServers] = useState(false);
  const isActive = !ban.until || new Date(ban.until) > new Date();

  return (
    <BanCard $isActive={isActive}>
      <Header>
        <div>
          <Chip color={isActive ? 'error' : 'default'}>
            {isActive ? 'ACTIVE' : 'EXPIRED'}
          </Chip>
          <Chip variant="outline">{ban.domainName}</Chip>
        </div>
        {ban.isGlobal && <Chip color="warning">GLOBAL BAN</Chip>}
      </Header>

      <BanDetails>
        <div>
          <Label>Reason</Label>
          <Value>{ban.reason}</Value>
        </div>

        <div>
          <Label>Banned</Label>
          <DateFormatter value={ban.createdAt} format="relative" />
        </div>

        <div>
          <Label>Expires</Label>
          <Value>
            {ban.until ? (
              <DateFormatter value={ban.until} format="datetime" />
            ) : (
              'Never (Permanent)'
            )}
          </Value>
        </div>

        {ban.gameServerName && (
          <div>
            <Label>Server</Label>
            <Value>{ban.gameServerName}</Value>
          </div>
        )}
      </BanDetails>

      {ban.affectedServers && ban.affectedServers.length > 0 && (
        <Collapsible
          isOpen={showServers}
          onToggle={() => setShowServers(!showServers)}
          trigger={
            <Button variant="text" size="small">
              {showServers ? 'Hide' : 'Show'} affected servers ({ban.affectedServers.length})
            </Button>
          }
        >
          <ServerList>
            {ban.affectedServers.map((server) => (
              <ServerItem key={server.id}>
                {server.name} ({server.type})
              </ServerItem>
            ))}
          </ServerList>
        </Collapsible>
      )}
    </BanCard>
  );
};
```

##### StatsSummary.tsx

```typescript
import { Stats, Skeleton } from '@takaro/lib-components';
import { GlobalBanStats } from '../../types';

interface Props {
  data: GlobalBanStats | null;
  isLoading: boolean;
}

export const StatsSummary: React.FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Stats>
        {[1, 2, 3, 4].map((i) => (
          <Stats.Stat key={i}>
            <Skeleton width="100px" height="20px" />
            <Skeleton width="60px" height="32px" />
          </Stats.Stat>
        ))}
      </Stats>
    );
  }

  if (!data) return null;

  return (
    <Stats layout="horizontal">
      <Stats.Stat
        description="Total Bans"
        value={data.totalBans.toLocaleString()}
      />
      <Stats.Stat
        description="Active Bans"
        value={data.activeBans.toLocaleString()}
        color="error"
      />
      <Stats.Stat
        description="This Week"
        value={data.bansThisWeek.toLocaleString()}
        color="primary"
      />
      <Stats.Stat
        description="This Month"
        value={data.bansThisMonth.toLocaleString()}
      />
    </Stats>
  );
};
```

##### BanTrendsChart.tsx

```typescript
import { LineChart, Skeleton } from '@takaro/lib-components';
import { BanTrendData } from '../../types';

interface Props {
  data: BanTrendData[] | undefined;
  isLoading: boolean;
}

export const BanTrendsChart: React.FC<Props> = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton height="300px" />;
  if (!data) return null;

  const chartData = {
    labels: data.map(d => formatDate(d.date)),
    datasets: [{
      label: 'Daily Bans',
      data: data.map(d => d.count),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `Bans: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  return <LineChart data={chartData} options={options} height="300px" />;
};
```

#### Custom Hooks

##### useBanSearch.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { handleRateLimit } from '../utils/rateLimit';

export const useBanSearch = (playerId: string, platform: string) => {
  return useQuery({
    queryKey: ['ban-search', playerId, platform],
    queryFn: async () => {
      try {
        const response = await apiClient.public.bans.search({
          playerId,
          platformType: platform === 'all' ? undefined : platform,
        });
        return response.data;
      } catch (error) {
        if (error.response?.status === 429) {
          handleRateLimit(error.response);
        }
        throw error;
      }
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error.response?.status === 429) return false;
      return failureCount < 2;
    },
  });
};
```

##### useBanStats.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

interface Options {
  summary?: boolean;
  detailed?: boolean;
}

export const useBanStats = (options: Options = {}) => {
  const query = useQuery({
    queryKey: ['ban-stats', options],
    queryFn: () => apiClient.public.bans.stats(),
    staleTime: 60 * 60 * 1000, // 1 hour (matches cache)
    refetchInterval: 60 * 60 * 1000, // Auto-refresh every hour
  });

  return {
    ...query,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
};
```

##### useRateLimit.ts

```typescript
import { useState, useEffect } from 'react';

export const useRateLimit = () => {
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    resetTime: Date | null;
  }>({ remaining: 10, resetTime: null });

  useEffect(() => {
    const handleRateLimitUpdate = (event: CustomEvent) => {
      setRateLimitInfo(event.detail);
    };

    window.addEventListener('rateLimit', handleRateLimitUpdate as EventListener);
    return () => {
      window.removeEventListener('rateLimit', handleRateLimitUpdate as EventListener);
    };
  }, []);

  return rateLimitInfo;
};
```

## Data Models

### API Data Transfer Objects

#### PublicBanSearchDTO

```typescript
export class PublicBanSearchDTO {
  playerId: string; // Steam ID, EOS ID, Xbox ID, etc.
  platformType: string; // 'steam', 'eos', 'xbox', etc.
}
```

#### PublicBanSearchResultDTO

```typescript
export class PublicBanSearchResultDTO {
  playerId: string;
  platformType: string;
  bans: BanInfo[];
  totalBans: number;
}

export class BanInfo {
  id: string;
  reason: string;
  createdAt: string;
  until?: string;
  isGlobal: boolean;
  domainName: string;
  gameServerName: string;
  gameServerType: string;
}
```

#### GlobalBanStatsDTO

```typescript
export class GlobalBanStatsDTO {
  totalBans: number;
  activeBans: number;
  bansThisWeek: number;
  bansThisMonth: number;
  banTrends: BanTrendData[];
}

export class BanTrendData {
  date: string;
  count: number;
}
```

### Database Queries

#### Cross-Domain Ban Search

```sql
SELECT
  b.id,
  b.reason,
  b.created_at,
  b.until,
  b.is_global,
  d.name as domain_name,
  gs.name as gameserver_name,
  gs.type as gameserver_type
FROM bans b
JOIN players p ON b.player_id = p.id
JOIN domains d ON b.domain_id = d.id
LEFT JOIN gameservers gs ON b.gameserver_id = gs.id
LEFT JOIN settings s ON (s.domain_id = d.id AND s.key = 'shareBanInfoGlobally')
WHERE (p.steam_id = ? OR p.epic_online_services_id = ? OR p.xbox_live_id = ?)
  AND COALESCE(s.value, 'true') = 'true'  -- Default to true if setting doesn't exist
ORDER BY b.created_at DESC;
```

#### Global Statistics Query

```sql
-- Total and active bans (only from domains that share ban info)
SELECT
  COUNT(*) as total_bans,
  COUNT(CASE WHEN (until IS NULL OR until > NOW()) THEN 1 END) as active_bans
FROM bans b
JOIN domains d ON b.domain_id = d.id
LEFT JOIN settings s ON (s.domain_id = d.id AND s.key = 'shareBanInfoGlobally')
WHERE COALESCE(s.value, 'true') = 'true';  -- Default to true if setting doesn't exist

-- Recent ban counts (only from domains that share ban info)
SELECT
  COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as bans_this_week,
  COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as bans_this_month
FROM bans b
JOIN domains d ON b.domain_id = d.id
LEFT JOIN settings s ON (s.domain_id = d.id AND s.key = 'shareBanInfoGlobally')
WHERE COALESCE(s.value, 'true') = 'true';  -- Default to true if setting doesn't exist
```

## Error Handling

### Backend Error Responses

```typescript
// Rate limit exceeded
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "statusCode": 429
}

// Invalid player ID format
{
  "error": "Bad Request",
  "message": "Invalid player ID format for specified platform",
  "statusCode": 400
}

// No bans found
{
  "playerId": "76561198000000000",
  "platformType": "steam",
  "bans": [],
  "totalBans": 0
}
```

### Frontend Error Handling

- **Network Errors**: Display retry button with error message
- **Rate Limiting**: Show countdown timer until next request allowed
- **Invalid Input**: Real-time validation with helpful error messages
- **No Results**: Clear messaging that no bans were found

## Testing Strategy

### Backend Testing

```typescript
describe('PublicBanController', () => {
  describe('POST /public/bans/search', () => {
    it('should return bans for valid Steam ID');
    it('should return empty results for unbanned player');
    it('should enforce rate limiting');
    it('should validate input format');
  });

  describe('GET /public/bans/stats', () => {
    it('should return cached statistics');
    it('should refresh cache after expiration');
  });
});
```

### Frontend Testing

```typescript
describe('BanSearchPage', () => {
  it('should render search form');
  it('should handle search submission');
  it('should display search results');
  it('should handle rate limit errors');
});

describe('BanStatsPage', () => {
  it('should load and display statistics');
  it('should render charts correctly');
});
```

### Integration Testing

- End-to-end search flow from frontend to backend
- Rate limiting behavior under load
- Cache invalidation and refresh cycles
- Cross-domain ban aggregation accuracy

## Security Considerations

### Rate Limiting

- IP-based rate limiting to prevent abuse
- Different limits for search vs stats endpoints
- Graceful degradation when limits exceeded

### Data Privacy

- Only expose necessary ban information
- No personal player information beyond gaming platform IDs
- Domain names shown but no sensitive domain data
- Respect domain privacy settings - exclude domains that opt out of global sharing
- Domain administrators have full control over ban information sharing

### Input Validation

- Strict validation of player ID formats per platform
- SQL injection prevention through parameterized queries
- XSS prevention in frontend display components

## Performance Optimization

### Backend Optimizations

- Database indexes on player platform IDs
- Redis caching for statistics with 1-hour TTL
- Optimized cross-domain queries with proper JOINs
- Connection pooling for database access

### Frontend Optimizations

- Code splitting for search and stats pages
- Lazy loading of chart components
- Debounced search input to reduce API calls
- Responsive design for mobile performance

### Monitoring

- API response time metrics
- Cache hit/miss ratios
- Rate limiting trigger frequency
- Database query performance tracking
