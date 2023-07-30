import { styled } from '@takaro/lib-components';
import { EventFeed } from 'components/EventFeed';
import { EventFeedItem } from 'components/EventFeed/EventFeedItem';
import { FC } from 'react';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

export const Events: FC = () => {
  return (
    <Wrapper>
      <EventFeed>
        <EventFeedItem
          eventType="chat-message"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            player: 'brunkel',
            message: 'Hello world!',
            server: 'My server',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
        <EventFeedItem
          eventType="player-disconnected"
          createdAt="2023-07-30T00:00:00.000Z"
          data={{
            player: 'brunkel',
            server: 'My server',
          }}
          onDetailClick={() => {
            console.log('second');
          }}
        />
        <EventFeedItem
          eventType="player-connected"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            player: 'brunkel',
            server: 'My server',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
        <EventFeedItem
          eventType="user-login"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            user: 'branco',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
        <EventFeedItem
          eventType="chat-message"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            player: 'brunkel',
            message: 'pipi kaka',
            server: 'My server',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
        <EventFeedItem
          eventType="player-disconnected"
          createdAt="2023-07-30T00:00:00.000Z"
          data={{
            player: 'brunkel',
            server: 'My server',
          }}
          onDetailClick={() => {
            console.log('second');
          }}
        />
        <EventFeedItem
          eventType="player-connected"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            player: 'brunkel',
            server: 'My server',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
        <EventFeedItem
          eventType="user-login"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            user: 'branco',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
        <EventFeedItem
          eventType="chat-message"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            player: 'brunkel',
            message: 'pipi kaka',
            server: 'My server',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
      </EventFeed>
    </Wrapper>
  );
};
