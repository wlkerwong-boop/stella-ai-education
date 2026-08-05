import { authGetUser, dbGet } from '@/lib/supabase';
import { parseBearerToken } from '@/lib/bearer-token';
import { hasSiteAccess } from '@/lib/site-access';

export { parseBearerToken };

export async function getProfileForToken(token: string) {
  const user = await authGetUser(token);
  const profile = await dbGet(
    'profiles',
    `auth_id=eq.${user.id}`,
    'id,nickname,email,sites',
    token,
  ) as { id: string; nickname?: string; email?: string; sites?: string[] } | null;
  if (!profile || !hasSiteAccess(profile.sites, 'stella')) {
    throw new Error('STELLA_ACCESS_REQUIRED');
  }
  return profile;
}
