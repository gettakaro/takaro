import { getTakaro, getData } from '@takaro/helpers';

function formatMs(milliseconds) {
  const oneSecond = 1000;
  const oneMinute = oneSecond * 60;
  const oneHour = oneMinute * 60;
  const oneDay = oneHour * 24;

  if (milliseconds < oneSecond) {
    return milliseconds + ' milliseconds';
  } else if (milliseconds < oneMinute) {
    const seconds = Math.floor(milliseconds / oneSecond);
    return seconds + ' seconds';
  } else if (milliseconds < oneHour) {
    const minutes = Math.floor(milliseconds / oneMinute);
    const seconds = Math.floor((milliseconds % oneMinute) / oneSecond);
    return `${minutes} minutes ${seconds} seconds`;
  } else if (milliseconds < oneDay) {
    const hours = Math.floor(milliseconds / oneHour);
    const minutes = Math.floor((milliseconds % oneHour) / oneMinute);
    const seconds = Math.floor((milliseconds % oneMinute) / oneSecond);
    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  } else {
    const days = Math.floor(milliseconds / oneDay);
    const hours = Math.floor((milliseconds % oneDay) / oneHour);
    const minutes = Math.floor((milliseconds % oneHour) / oneMinute);
    const seconds = Math.floor((milliseconds % oneMinute) / oneSecond);
    return `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
  }
}

async function main() {
  const data = await getData();
  const takaro = await getTakaro();

  const { player, module: mod } = data;

  const cronjob = (
    await takaro.cronjob.cronJobControllerSearch({ filters: { name: ['drawLottery'], moduleId: [mod.moduleId] } })
  ).data.data[0];

  await player.pm(`The next lottery draw is in about ${formatMs(cronjob.nextRunIn)}`);
}

await main();
