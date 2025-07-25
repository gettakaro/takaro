import { PaginationProps, SelectQueryField, styled } from '@takaro/lib-components';
import { FC, useState } from 'react';
import { CustomSelectProps } from '.';
import { discordGuildInfiniteQueryOptions, discordGuildRolesQueryOptions } from '../../queries/discord';
import { DiscordRoleOutputDTO } from '@takaro/apiclient';
import { useInfiniteQuery, useQueries } from '@tanstack/react-query';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

interface DiscordRole extends DiscordRoleOutputDTO {
  guildId: string;
  guildName: string;
}

export const DiscordRoleSelectQueryField: FC<CustomSelectProps> = ({
  control,
  name,
  loading,
  required,
  hint,
  size,
  label = 'Discord Role',
  disabled,
  description,
  readOnly,
  canClear,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch Discord guilds
  const {
    data: guildsData,
    isLoading: isLoadingGuilds,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery(
    discordGuildInfiniteQueryOptions({
      limit: 20,
      filters: {
        takaroEnabled: [true],
      },
    }),
  );

  const guilds = guildsData?.pages.flatMap((page) => page.data) ?? [];

  // Fetch roles for each guild
  const roleQueries = useQueries({
    queries: guilds.map((guild) => discordGuildRolesQueryOptions(guild.id)),
  });

  const isLoadingRoles = roleQueries.some((query) => query.isLoading);

  // Combine all roles with guild information
  const allRoles: DiscordRole[] = [];
  roleQueries.forEach((query, index) => {
    if (query.data && guilds[index]) {
      const guild = guilds[index];
      query.data.forEach((role) => {
        allRoles.push({
          ...role,
          guildId: guild.id,
          guildName: guild.name,
        });
      });
    }
  });

  // Filter roles based on search term
  const filteredRoles = allRoles.filter((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoadingGuilds || isLoadingRoles) {
    return <div>Loading Discord roles...</div>;
  }

  if (guilds.length === 0) {
    return <div>No Discord guilds connected</div>;
  }

  return (
    <DiscordRoleSelectView
      control={control}
      name={name}
      roles={filteredRoles}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      hint={hint}
      required={required}
      loading={loading}
      label={label}
      canClear={canClear}
      setSearchTerm={setSearchTerm}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isFetching={isFetching}
    />
  );
};

export type DiscordRoleSelectViewProps = CustomSelectProps &
  PaginationProps & {
    roles: DiscordRole[];
    setSearchTerm: (term: string) => void;
  };

export const DiscordRoleSelectView: FC<DiscordRoleSelectViewProps> = ({
  control,
  roles,
  name: selectName,
  readOnly,
  description,
  size,
  disabled,
  hint,
  required,
  canClear,
  loading,
  label,
  isFetching,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  setSearchTerm,
}) => {
  // Group roles by guild
  const rolesByGuild = roles.reduce(
    (acc, role) => {
      if (!acc[role.guildName]) {
        acc[role.guildName] = [];
      }
      acc[role.guildName].push(role);
      return acc;
    },
    {} as Record<string, DiscordRole[]>,
  );

  return (
    <SelectQueryField
      name={selectName}
      control={control}
      debounce={500}
      label={label}
      readOnly={readOnly}
      hint={hint}
      disabled={disabled}
      size={size}
      description={description}
      required={required}
      loading={loading}
      canClear={canClear}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      handleInputValueChange={(value) => setSearchTerm(value)}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select Discord role...</div>;
        }

        const selectedRole = roles.find((role) => role.id === selectedItems[0]?.value);
        return <div>{selectedRole ? `${selectedRole.name} (${selectedRole.guildName})` : 'Unknown role'}</div>;
      }}
    >
      {Object.entries(rolesByGuild).map(([guildName, guildRoles]) => (
        <SelectQueryField.OptionGroup key={guildName} label={guildName}>
          {guildRoles.map((role) => (
            <SelectQueryField.Option key={`select-${role.id}`} value={role.id} label={role.name}>
              <Inner>
                <span style={{ color: `#${role.color.toString(16).padStart(6, '0')}` }}>●</span>
                <span style={{ marginLeft: '8px' }}>{role.name}</span>
              </Inner>
            </SelectQueryField.Option>
          ))}
        </SelectQueryField.OptionGroup>
      ))}
    </SelectQueryField>
  );
};
