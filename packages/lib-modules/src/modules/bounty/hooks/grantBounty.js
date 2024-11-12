import { takaro, data } from '@takaro/helpers';

async function main() {
  const { gameServerId, module: mod } = data;
  const { player: killed, attacker } = data;
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  // attacker is null, player is not killed by another player so should not be granted bounty
  if (attacker && attacker.steamId !== killed.steamId) {
    const bountyVariables = (
      await takaro.variable.variableControllerSearch({
        filters: {
          key: ['bounty'],
          gameServerId: [gameServerId],
          moduleId: [mod.moduleId],
        },
      })
    ).data.data;

    // get player and pog
    const killed_player = (await takaro.player.playerControllerSearch({ filters: { steamId: [killed.steamId] } })).data
      .data[0];

    const attacker_player = (
      await takaro.player.playerControllerSearch({
        filters: { steamId: [attacker.steamId] },
      })
    ).data.data[0];

    const killed_pog = (
      await takaro.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: { playerId: [killed_player.id], gameServerId: [gameServerId] },
      })
    ).data.data[0];

    const attacker_pog = (
      await takaro.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: { playerId: [attacker_player.id], gameServerId: [gameServerId] },
      })
    ).data.data[0];

    // all bounties on the player
    const bountiesOnKilledPlayer = bountyVariables.filter((v) => {
      const value = JSON.parse(v.value);
      return value.targetId === killed_pog.id;
    });

    let totalBounty = 0;
    const payouts = bountiesOnKilledPlayer.map(async (v) => {
      const { amount } = JSON.parse(v.value);
      totalBounty += amount;
      return takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(attacker_pog.id, {
        currency: amount,
      });
    });

    const removedBounties = bountiesOnKilledPlayer.map(async (v) => {
      return takaro.variable.variableControllerDelete(v.id);
    });

    await Promise.all([...payouts, ...removedBounties]);

    // use the names received from the gameserver.
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `${attacker.name} has been awarded a bounty of ${totalBounty} ${currencyName} for defeating ${killed.name}.`,
    });
  }

  return;
}

await main();
