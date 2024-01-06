import croner from 'croner';

export const nextCronJobRun = (cron: string): Date | null => {
  return croner.Cron(cron).nextRun();
};
