# Mock game server

This application is used as a test server where we don't have to worry about game-specific weirdnesses

## Installation

To install this package, navigate to the root directory of the project and run the following command:

```bash
npm install @takaro/app-mock-gameserver
```


## AI Prompts

To generate testing data, we use AI to generate series of logs that we can replay later. A starter prompt for that is provided here, you can use ChatGPT to further prompt the system for different scenarios.


```
I want you to write a series of events that happen on a game server. You are creating testing data. Create collections of logs that start at a certain timestamp and increase the number realistically. There are max 5 players total.

Let the players have conversations about adventures that happened to them inside the game and let them interact with each other. Players should occasionally use chat commands, the available commands are '/ping' '/settp {teleport name}' '/teleport {teleport name}'. Make sure that if a player sets a teleport, only the player that set that teleport uses it. Do include the input messages (like "/ping") in the logs but do NOT include the result of the commands.

The 'time' parameter is the amount of milliseconds since the start of the game. This should be seemingly random, do not have static intervals between events. It should look realistic. The 'event' parameter is the type of event that happened. The 'data' parameter is the data that is relevant to the event. 

The available events are:

export enum GameEvents {
  LOG_LINE = 'log',
  PLAYER_CONNECTED = 'player-connected',
  PLAYER_DISCONNECTED = 'player-disconnected',
  CHAT_MESSAGE = 'chat-message',
}

export class BaseEvent<T> extends TakaroDTO<T> {
  timestamp: Date = new Date();
  type: string;
  msg: string;
}

export class EventLogLine extends BaseEvent<EventLogLine> {
  type = GameEvents.LOG_LINE;
}

export class EventPlayerConnected extends BaseEvent<EventPlayerConnected> {
  type = GameEvents.PLAYER_CONNECTED;
  player: IGamePlayer;
}

export class EventPlayerDisconnected extends BaseEvent<EventPlayerDisconnected> {
  type = GameEvents.PLAYER_DISCONNECTED;
  player: IGamePlayer;
}

export class EventChatMessage extends BaseEvent<EventChatMessage> {
  type = GameEvents.CHAT_MESSAGE;
  player?: IGamePlayer;
  declare msg: string;
}

Generate 50 events, starting at time 0.

Only reply with ndjson, no extra explanation, put it inside a codeblock and do it in the following style 

{"time": 0, "event": "player-connected", "data": {"player": "1"}}
{"time": 500, "event": "chat-message", "data": {"msg": "hello everyone", "player": "1"}}
```