import { AxiosError } from 'axios';

type ErrorType = {
  status: number;
};

export type TakaroError = AxiosError<ErrorType>;
