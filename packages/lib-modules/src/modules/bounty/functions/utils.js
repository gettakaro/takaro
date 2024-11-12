import { takaro } from '@takaro/helpers';

export async function findBounty(gameServerId, moduleId, playerId, targetId) {
  const bounties = await takaro.variable.variableControllerSearch({
    filters: {
      key: ['bounty'],
      moduleId: [moduleId],
      gameServerId: [gameServerId],
      playerId: [playerId],
    },
  });

  return bounties.data.data.find((bountyVariable) => {
    const value = JSON.parse(bountyVariable.value);
    return value.targetId === targetId;
  });
}
