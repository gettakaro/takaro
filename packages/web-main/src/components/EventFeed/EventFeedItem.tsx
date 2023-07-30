import { FC } from 'react';
import { styled } from '@takaro/lib-components';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: top;
  width: 100%;
`;

const EventType = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['0_5']};

  p:first-child {
    font-weight: bold;
  }

  p:last-child {
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const ListItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['4']};
`;

const Data = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
`;

const DataItem = styled.div`
  p:first-child {
    text-transform: capitalize;
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const DetailButton = styled.a`
  color: ${({ theme }) => theme.colors.textAlt};
  text-decoration: underline;
  cursor: pointer;
`;

const Circle = styled.div`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  margin-top: 5px;
  left: -6px;

  position: absolute;
  border: 1px solid #474747;

  background-color: ${({ theme }) => theme.colors.textAlt};
`;
const EventProperty: FC<{ name: string; value: string }> = ({ name, value }) => {
  return (
    <DataItem>
      <p>{name}</p>
      <p>{value}</p>
    </DataItem>
  );
};

export type EventFeedItemProps = {
  eventType: string;
  createdAt: string;
  data: Record<string, string>;
  onDetailClick: () => void;
};

function getTimeAgo(timestamp: number) {
  const now = new Date();
  const time = new Date(timestamp);

  const secondsPast = Math.floor((now.getTime() - time.getTime()) / 1000);

  const format = (value: number, timeUnit: string) => {
    return `${value} ${timeUnit}${value === 1 ? '' : 's'} ago`;
  };

  if (secondsPast < 60) {
    return format(secondsPast, 'second');
  }

  const minutesPast = Math.floor(secondsPast / 60);
  if (minutesPast < 60) {
    return format(minutesPast, 'minute');
  }

  const hoursPast = Math.floor(minutesPast / 60);
  if (hoursPast < 24) {
    return format(hoursPast, 'hour');
  }

  const daysPast = Math.floor(hoursPast / 24);
  if (daysPast < 365) {
    return format(daysPast, 'day');
  }

  const yearsPast = Math.floor(daysPast / 365);
  return format(yearsPast, 'year');
}

export const EventFeedItem: FC<EventFeedItemProps> = ({ eventType, createdAt, data, onDetailClick }) => {
  const timestamp = Date.parse(createdAt);
  const timeAgo = getTimeAgo(timestamp);

  return (
    <ListItem>
      <Circle />
      <Header>
        <EventType>
          <p>{eventType}</p>
          <p>{timeAgo}</p>
        </EventType>
        <DetailButton onClick={onDetailClick}>view details</DetailButton>
      </Header>
      <Data>
        {Object.keys(data).map((key) => {
          return <EventProperty name={key} value={data[key]} />;
        })}
      </Data>
    </ListItem>
  );
};
