import { nextCronJobRun, data } from '@takaro/helpers';

function formatTimeToReach(cronJob) {
  const targetDate = nextCronJobRun(cronJob);

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
  const { player, module: mod } = data;
  await player.pm(
    `The next lottery draw is in about ${formatTimeToReach(mod.systemConfig.cronJobs.drawLottery.temporalValue)}`
  );
}

await main();
