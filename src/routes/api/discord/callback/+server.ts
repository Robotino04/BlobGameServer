import { turnCodeToTokens } from "$lib/discordAuth";
import { json, redirect } from "@sveltejs/kit";

export async function GET({ url, cookies }) {
  // fetch returnCode set in the URL parameters.
  const returnCode = url.searchParams.get('code');

  if (returnCode === null) {
    return json({ error: "You should never have to access this directly." });
  }
  const tokens = await turnCodeToTokens(returnCode)

  // redirect to front page in case of error
  if (tokens.error) {
    throw redirect(302, "/");
  }

  const access_token_expires_in = new Date(Date.now() + tokens.expires_in); // 10 minutes
  const refresh_token_expires_in = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  cookies.set("discord_access_token", tokens.access_token, { expires: access_token_expires_in, path: "/" });
  cookies.set("discord_refresh_token", tokens.refresh_token, { expires: refresh_token_expires_in, path: "/" });

  throw redirect(302, "/");
}