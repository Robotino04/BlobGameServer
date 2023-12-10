import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export async function GET({ cookies }) {
    cookies.delete("discord_access_token", { path: "/" });
    cookies.delete("discord_refresh_token", { path: "/" });
    throw redirect(302, base)
}