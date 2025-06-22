import {
  EventChatMessage,
  EventPlayerConnected,
  EventPlayerDisconnected,
  EventPlayerDeath,
  EventEntityKilled,
  EventLogLine,
  GameEvents,
  IGamePlayer,
  IPosition,
  ChatChannel,
} from '@takaro/modules';
import { logger } from '@takaro/util';

interface ConnectionEventResult {
  type: string;
  data: EventPlayerConnected | EventPlayerDisconnected;
}

export class EventGenerator {
  private log = logger('EventGenerator');

  // Predefined content arrays
  private static readonly CHAT_MESSAGES = [
    // Very short (1-3 words)
    'gg',
    'lol',
    'brb',
    'help!',
    'nice!',
    'oof',
    'anyone?',
    'hey',
    'sup',
    'thx',
    'np',
    'omg',
    'wow',
    'rip',
    'f',
    'same',
    'agreed',
    'nope',
    'yes!',
    'nooo',
    'afk',
    'back',
    'lag?',

    // Short (4-7 words)
    'Hello everyone!',
    'Anyone want to team up?',
    'Where is everyone?',
    'Anyone need help?',
    'Great game so far',
    'Found some good loot',
    'Heading to the base',
    'This area looks dangerous',
    'Nice weather today',
    'Anyone seen any zombies?',
    'I need some resources',
    'Thanks for the help!',
    'Need some food badly',
    'This place is creepy',
    'Found a good spot',
    'Trading iron for diamonds',
    'Zombies everywhere help me',
    'Just died again fml',
    'Anyone have spare ammo?',
    'Where did you go?',
    'On my way now',
    'Be there in 5',
    'Watch out behind you!',
    'I hear them coming',

    // Medium (8-15 words)
    'Just found an awesome base location near the river, anyone want to join?',
    'Does anyone know where I can find more ammunition around here?',
    'I think there might be a horde coming from the north side',
    'Been working on my base all day and finally got the walls up',
    'The trader has some really good deals today, you should check it out',
    'Why do I always run out of food at the worst possible times?',
    'This new update is amazing, the graphics look so much better now',
    'Just cleared out a whole building, so much loot inside!',
    'Anyone else having connection issues or is it just me?',
    'Found a secret bunker at coordinates 250, -150, tons of military gear',
    'My base got raided while I was offline, lost everything',
    'Finally crafted my first motorcycle, this changes everything!',

    // Long (15+ words)
    'So I was exploring the abandoned city and found this huge stash of weapons in a police station, but there were like 20 zombies guarding it',
    "Anyone else having trouble with the new zombie AI? They seem way smarter now and keep finding ways into my base through gaps I didn't even know existed",
    "I've been playing for 3 hours straight and still haven't found any diamonds... am I looking in the wrong places or just unlucky?",
    "Hey everyone, I'm setting up a trading post at coordinates 150, -200. I'll trade food for building materials. Also looking for someone to help defend it at night",
    'Just had the most intense fight ever - three zombie dogs, two cops, and a bunch of regular zombies all at once. Barely survived with 5 health',
    "Has anyone figured out the best way to farm yet? I'm trying to set up a sustainable food source but the crops keep dying",
    'The blood moon last night was insane! My entire east wall got destroyed and I had to rebuild everything from scratch this morning',
    "I found this amazing cave system that goes super deep underground. There's iron everywhere but also lots of zombies. Anyone brave enough to explore it with me?",

    // Very long story-like messages
    'Okay so funny story: I was sneaking through a house looking for loot when I accidentally triggered an alarm. Next thing I know, the entire neighborhood of zombies is chasing me. I ran for like 10 minutes straight and ended up jumping off a cliff into water. Lost half my health but survived!',
    "PSA: Don't go near the military base at night. I repeat, DO NOT GO NEAR THE MILITARY BASE AT NIGHT. Just lost all my best gear trying to loot it. There must be 50+ zombies there and they respawn super fast",
    "Just wanted to share my base design strategy: I dig a deep moat around the entire perimeter, fill it with spikes, then build bridges that I can destroy during blood moons. It's worked perfectly for the last 3 attacks. Happy to help anyone set up something similar",
    "So I've been experimenting with different base locations and I think I found the perfect spot: it's on top of a hill with natural cliffs on three sides, near water, close to a town for looting, but far enough away that zombies don't randomly spawn. Coordinates are 700, 450 if anyone wants to be neighbors",

    // Questions of varying length
    'how?',
    'where?',
    'really?',
    'anyone online?',
    "what's the best weapon?",
    'how do I craft antibiotics?',
    'where do I find oil?',
    'what level are you?',
    'has anyone found the trader yet this week?',
    "what's the best way to deal with zombie dogs? they keep killing me",
    'is it just me or did they make nights darker in the last update? I can barely see anything without a torch now',
    "does anyone know if there's a limit to how many vehicles you can have? I want to start a collection",
    "what's better for base defense: wood spikes or barbed wire? I can't decide",

    // Reactions and contextual responses
    "that's rough",
    'I feel your pain',
    'happens to me all the time',
    'you should try going underground, much safer',
    'nah the military base is easy if you have good gear',
    'I can help with that, give me 5 minutes to get there',
    'try using a sledgehammer, works every time',
    "you need to cook it first or you'll get sick",
    'the desert biome has tons of oil',
    "zombies can't swim, use that to your advantage",
    'always carry bandages, trust me on this',

    // Random observations and comments
    'this game is so addictive',
    'I should probably go to sleep soon',
    "one more hour then I'm done",
    'why is it always raining when I need to travel',
    'these graphics are incredible',
    'the sound design in this game is terrifying',
    'I love the base building mechanics',
    'inventory management is my biggest enemy',
    'I spend more time organizing than playing',
    'just found my first helicopter crash!',
    "is that a bear? OH NO IT'S A BEAR",
    'accidentally ate raw meat again...',
    'my stamina bar is broken I swear',
    'how do people build such amazing bases',
    "I'm basically a hoarder at this point",
    'do vehicles despawn if you leave them?',
    "my character hasn't slept in 3 days lol",

    // Complaints and frustrations
    'this is bs',
    'I hate vultures so much',
    'lost all my stuff AGAIN',
    'why do I even try',
    'rage quit incoming',
    'this game hates me',
    'zombies are too OP',
    'nerf the dogs please',
    'fix the spawning already',
    'another crash great',
    'there goes 2 hours of progress',
    'why did I click that',
    "I'm uninstalling",
    "jk I'm addicted",
    "can't quit now",

    // Helpful tips and advice
    'pro tip: crouch to avoid mines',
    'honey is the best healing item',
    'always have an escape route planned',
    'two exits minimum for any base',
    'dig straight down for easy stone',
    'snow biome = infinite water',
    'cactus gives you water in desert',
    "zombies can't break steel blocks",
    'put your forge underground',
    'birds mean a horde is coming',
    'red sky at night, zombies delight',
    'green repair kits are gold',
    'level 5 tools are worth it',
    'spec into one weapon type first',
    'stamina > health early game',
  ];

  private static readonly ENTITIES = [
    'zombie',
    'skeleton',
    'spider',
    'creeper',
    'wolf',
    'bear',
    'deer',
    'rabbit',
    'pig',
    'cow',
    'chicken',
    'sheep',
    'witch',
    'enderman',
    'slime',
    'bat',
  ];

  private static readonly WEAPONS = [
    'sword',
    'bow',
    'rifle',
    'pistol',
    'axe',
    'spear',
    'crossbow',
    'knife',
    'club',
    'hammer',
    'mace',
    'dagger',
    'shotgun',
    'sniper',
    'machete',
    'staff',
  ];

  private static readonly ITEMS = [
    'wood',
    'stone',
    'iron ore',
    'gold nugget',
    'apple',
    'bread',
    'water bottle',
    'bandage',
    'coal',
    'diamond',
    'emerald',
    'ruby',
    'rope',
    'torch',
    'lantern',
    'map',
  ];

  private static readonly ACTIONS = [
    'picked up',
    'dropped',
    'crafted',
    'found',
    'collected',
    'discovered',
    'obtained',
    'acquired',
  ];

  /**
   * Generate a random chat message event
   */
  generateChatMessage(players: Array<{ player: IGamePlayer; meta: any }>): EventChatMessage {
    const randomPlayer = this.getRandomPlayer(players);
    const message = this.getRandomElement(EventGenerator.CHAT_MESSAGES);
    const channel = this.getRandomChatChannel();

    return new EventChatMessage({
      player: randomPlayer.player,
      msg: message,
      channel,
      type: GameEvents.CHAT_MESSAGE,
    });
  }

  /**
   * Generate a random connection/disconnection event
   */
  generateConnectionEvent(players: Array<{ player: IGamePlayer; meta: any }>): ConnectionEventResult {
    // Filter players by online status
    const onlinePlayers = players.filter((p) => p.meta.online);
    const offlinePlayers = players.filter((p) => !p.meta.online);

    this.log.debug('Connection event generation', {
      totalPlayers: players.length,
      onlinePlayers: onlinePlayers.length,
      offlinePlayers: offlinePlayers.length,
    });

    // Determine what action to take based on available players
    let shouldConnect: boolean;
    let availablePlayers: Array<{ player: IGamePlayer; meta: any }>;

    if (offlinePlayers.length === 0 && onlinePlayers.length > 0) {
      // Only online players available, must disconnect someone
      shouldConnect = false;
      availablePlayers = onlinePlayers;
    } else if (onlinePlayers.length === 0 && offlinePlayers.length > 0) {
      // Only offline players available, must connect someone
      shouldConnect = true;
      availablePlayers = offlinePlayers;
    } else if (offlinePlayers.length > 0 && onlinePlayers.length > 0) {
      // Both types available, prefer connecting offline players (70% chance)
      shouldConnect = Math.random() > 0.3;
      availablePlayers = shouldConnect ? offlinePlayers : onlinePlayers;
    } else {
      // No players available (shouldn't happen)
      throw new Error('No players available for connection event generation');
    }

    const selectedPlayer = this.getRandomElement(availablePlayers);

    if (shouldConnect) {
      const event = new EventPlayerConnected({
        player: selectedPlayer.player,
        msg: `${selectedPlayer.player.name} joined the game`,
        type: GameEvents.PLAYER_CONNECTED,
      });
      return { type: 'player-connected', data: event };
    } else {
      const event = new EventPlayerDisconnected({
        player: selectedPlayer.player,
        msg: `${selectedPlayer.player.name} left the game`,
        type: GameEvents.PLAYER_DISCONNECTED,
      });
      return { type: 'player-disconnected', data: event };
    }
  }

  /**
   * Generate a random player death event
   */
  generatePlayerDeath(players: Array<{ player: IGamePlayer; meta: any }>): EventPlayerDeath {
    const victim = this.getRandomPlayer(players);
    const hasAttacker = Math.random() > 0.4; // 60% chance of having an attacker
    const attacker =
      hasAttacker && players.length > 1
        ? this.getRandomPlayer(players.filter((p) => p.player.gameId !== victim.player.gameId))
        : undefined;

    const position = this.getPlayerPosition(victim);

    let message: string;
    if (attacker) {
      message = `${victim.player.name} was killed by ${attacker.player.name}`;
    } else {
      const causes = ['fell to their death', 'drowned', 'burned in lava', 'was eaten by zombies', 'died of hunger'];
      const cause = this.getRandomElement(causes);
      message = `${victim.player.name} ${cause}`;
    }

    return new EventPlayerDeath({
      player: victim.player,
      attacker: attacker?.player,
      position,
      msg: message,
      type: GameEvents.PLAYER_DEATH,
    });
  }

  /**
   * Generate a random entity kill event
   */
  generateEntityKill(players: Array<{ player: IGamePlayer; meta: any }>): EventEntityKilled {
    const killer = this.getRandomPlayer(players);
    const entity = this.getRandomElement(EventGenerator.ENTITIES);
    const weapon = this.getRandomElement(EventGenerator.WEAPONS);

    return new EventEntityKilled({
      player: killer.player,
      entity,
      weapon,
      msg: `${killer.player.name} killed a ${entity} with ${weapon}`,
      type: GameEvents.ENTITY_KILLED,
    });
  }

  /**
   * Generate a random item interaction log event
   */
  generateItemInteraction(players: Array<{ player: IGamePlayer; meta: any }>): EventLogLine {
    const player = this.getRandomPlayer(players);
    const item = this.getRandomElement(EventGenerator.ITEMS);
    const action = this.getRandomElement(EventGenerator.ACTIONS);
    const quantity = Math.floor(Math.random() * 10) + 1;

    const message = `${player.player.name} ${action} ${quantity}x ${item}`;

    return new EventLogLine({
      msg: message,
      type: GameEvents.LOG_LINE,
    });
  }

  /**
   * Get a random element from an array
   */
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get a random player from the players array
   */
  private getRandomPlayer(players: Array<{ player: IGamePlayer; meta: any }>): { player: IGamePlayer; meta: any } {
    if (players.length === 0) {
      throw new Error('No players available for event generation');
    }
    return this.getRandomElement(players);
  }

  /**
   * Get a random chat channel
   */
  private getRandomChatChannel(): ChatChannel {
    const channels = Object.values(ChatChannel);
    // Weight towards GLOBAL channel (70% chance)
    const weights = [0.7, 0.1, 0.1, 0.1]; // GLOBAL, TEAM, FRIENDS, WHISPER
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return channels[i];
      }
    }

    return ChatChannel.GLOBAL; // Fallback
  }

  /**
   * Extract position from player meta data
   */
  private getPlayerPosition(playerData: { player: IGamePlayer; meta: any }): IPosition | undefined {
    try {
      const position = playerData.meta?.position;
      if (
        position &&
        typeof position.x === 'number' &&
        typeof position.y === 'number' &&
        typeof position.z === 'number'
      ) {
        return new IPosition({
          x: position.x,
          y: position.y,
          z: position.z,
          dimension: position.dimension || 'overworld',
        });
      }
    } catch (error) {
      this.log.warn('Failed to extract player position:', error);
    }
    return undefined;
  }
}
