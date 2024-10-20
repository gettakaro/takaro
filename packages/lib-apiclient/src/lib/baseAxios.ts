import axios, { AxiosError, CreateAxiosDefaults } from 'axios';

/**
 * Creates an opinionated axios instance with defaults
 * Includes error handling (Axios by default throws a HUGE error)
 * @param opts CreateAxiosDefaults - Configuration for the axios instance
 */
export function createAxios(opts: CreateAxiosDefaults) {
  const axiosInstance = axios.create(opts);

  // Strip down the error to a more manageable size
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { status, statusText, headers, data } = error.response;
        return Promise.reject({
          status,
          statusText,
          headers,
          data,
        });
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        return Promise.reject({
          message: 'No response received',
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        return Promise.reject({
          message: error.message,
        });
      }
    },
  );

  return axiosInstance;
}
