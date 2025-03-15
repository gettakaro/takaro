import { DomainOutputDTO, MeOutputDTO } from '@takaro/apiclient';

export function getCurrentDomain(me: MeOutputDTO): DomainOutputDTO {
  const domains = me.domains;
  const currentDomain = me.domain;
  return domains.find((domain) => domain.id === currentDomain)!;
}
