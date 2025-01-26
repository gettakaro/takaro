import { SmallModuleVersionOutputDTO } from '@takaro/apiclient';
import semver from 'semver';

export function getNewestVersionExcludingLatestTag(
  versions: SmallModuleVersionOutputDTO[],
): SmallModuleVersionOutputDTO {
  const newestTag = semver.rsort(versions.filter((v) => v.tag !== 'latest').map((v) => v.tag))[0];
  return versions.find((v) => v.tag === newestTag)!;
}

export function versionGt(versionA: string, versionB: string): boolean {
  if (versionA === versionB) return false;
  if (versionA === 'latest') return true;
  if (versionB === 'latest') return false;
  return semver.gt(versionA, versionB);
}

export function versionLt(versionA: string, versionB: string): boolean {
  if (versionA === versionB) return false;
  if (versionA === 'latest') return false;
  if (versionB === 'latest') return true;
  return semver.lt(versionA, versionB);
}
