import { getTakaro, getData } from '@takaro/helpers';

function formatTimeToReach(timestamp) {
  // Parse the ISO string to get the timestamp
  const targetDate = new Date(timestamp);

  // Get the current date and time
  const currentDate = new Date();

  // Calculate the time difference in milliseconds
  const delta = targetDate - currentDate;

  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((delta % (1000 * 60)) / 1000);

  // Build the formatted string
  let formattedString = '';

  if (days > 0) {
    formattedString += `${days} day${days > 1 ? 's' : ''} `;
  }

  if (hours > 0) {
    formattedString += `${hours} hour${hours > 1 ? 's' : ''} `;
  }

  if (minutes > 0) {
    formattedString += `${minutes} minute${minutes > 1 ? 's' : ''} `;
  }

  if (seconds > 0) {
    formattedString += `${seconds} second${seconds > 1 ? 's' : ''} `;
  }

  return formattedString.trim();
}

async function main() {
  const data = await getData();
  const takaro = await getTakaro();

  const { player, module: mod } = data;

  const cronjob = (
    await takaro.cronjob.cronJobControllerSearch({ filters: { name: ['drawLottery'], moduleId: [mod.moduleId] } })
  ).data.data[0];

  await player.pm(`The next lottery draw is in about ${formatTimeToReach(cronjob.nextRunAt)}`);
}

await main();
