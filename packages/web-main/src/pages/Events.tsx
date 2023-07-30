import { styled } from '@takaro/lib-components';
import { EventFeed, EventItem } from 'components/EventFeed';
import { FC } from 'react';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

export const Events: FC = () => {
  return (
    <Wrapper>
      <EventFeed>
        <EventItem
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
        <EventItem
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
        <EventItem
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
        <EventItem
          eventType="user-login"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            user: 'branco',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
        <EventItem
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
        <EventItem
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
        <EventItem
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
        <EventItem
          eventType="user-login"
          createdAt="2023-07-30T11:12:00.000Z"
          data={{
            user: 'branco',
          }}
          onDetailClick={() => {
            console.log('first');
          }}
        />
        <EventItem
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
