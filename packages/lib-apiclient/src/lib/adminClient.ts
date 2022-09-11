import { DomainApi } from '../generated';
import { BaseApiClient, IApiClientConfig } from './baseClient';

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
