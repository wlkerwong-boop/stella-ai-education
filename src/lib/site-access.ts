export function hasSiteAccess(
  sites: string[] | null | undefined,
  site: string,
) {
  return Array.isArray(sites) && sites.includes(site);
}
