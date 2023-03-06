import { DomainApi } from '../generated/index.js';
import { BaseApiClient, IApiClientConfig } from './baseClient.js';

export class AdminClient extends BaseApiClient {
  constructor(config: IApiClientConfig) {
    super(config);
  }

  get domain() {
    return new DomainApi(
      {
        isJsonMime: this.isJsonMime,
      },
      '',
      this.axios
    );
  }
}
