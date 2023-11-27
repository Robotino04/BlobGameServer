import { error, json } from "@sveltejs/kit";
import { ScoreboardEntry, isValidJSONForScoreboardEntry } from "$lib/ScoreboardEntry";
import * as fs from "fs";
import { isDiscordUserInfo, type DiscordUserInfo } from "$lib/discordAuth.js";

// Yes this should be a DB but it works well up to at least
// 100'000 entries, at which point I will happily use a DB
console.log("Reading scores...");
let scores: ScoreboardEntry[] = JSON.parse(readFile("./data/scores.json") ?? "{\"scores\":[]}").scores;
console.log("Done.");

function saveScores() {
    writeFile("./data/scores.json", JSON.stringify({ scores: scores }));
}

setInterval(() => {
    saveScores();
}, 5000)

function shutdownGracefully() {
    saveScores();
}

process.on('SIGINT', shutdownGracefully);
process.on('SIGTERM', shutdownGracefully);

let submissions_on_cooldown: Map<string, Date> = new Map<string, Date>();

const MAX_OUT_OF_TIME_DIFFERENCE_MS = 1 * 60 * 60 * 1000; // 1 hour
const MAX_SCORE = 20_000;
const SUBMISSION_TIMEOUT_MS = 10 * 1000; // 1 minute
const MIN_PLAYERNAME_LENGTH = 4;


function handleRateLimiting(clientAddress: string) {
    if (submissions_on_cooldown.get(clientAddress) !== undefined) {
        let time_since_submission = (new Date().getTime() - submissions_on_cooldown.get(clientAddress)!.getTime());

        if (time_since_submission < SUBMISSION_TIMEOUT_MS) {
            let time_left = (SUBMISSION_TIMEOUT_MS - time_since_submission) / 1000;
            throw error(429, `You can only submit scores every ${SUBMISSION_TIMEOUT_MS / 1000} seconds. (${time_left}s left)`);
        }
        else {
            // a new time will be set below
        }
    }

    submissions_on_cooldown.set(clientAddress, new Date());
}

function detectObviousCheats(entry: ScoreboardEntry) {
    if (entry.score >= MAX_SCORE) {
        throw error(403, "Impossible submission.");
    }
}

function detectImpossibleEntries(entry: ScoreboardEntry) {
    if (Math.abs(entry.user_time.getTime() - new Date().getTime()) > MAX_OUT_OF_TIME_DIFFERENCE_MS) {
        throw error(400, "Too out of date.");
    }

    if (entry.score <= 0) {
        throw error(400, "Score cannot be <= 0.");
    }

    if (entry.playername.length < MIN_PLAYERNAME_LENGTH) {
        throw error(400, `Player name is too short. Use at least ${MIN_PLAYERNAME_LENGTH} characters.`);
    }
}


export function GET({ url }) {
    if (url.searchParams.get('n') === null) {
        throw error(400, `Request must include number of scores as query.`);
    }

    const o = parseInt(url.searchParams.get('o') ?? "0");
    const n = parseInt(url.searchParams.get('n')!);

    if (n > 500) {
        throw error(400, `Only request up to 500 scores at once.`);
    }

    return json({ scores: scores.slice(o, o + n), num_scores: scores.length });
}

function containsAccessToken(obj: any): obj is { discord_access_token: string } {
    return typeof obj.discord_access_token === "string";
}

const DISCORD_API_URL: string = import.meta.env.VITE_DISCORD_API_URL;
export async function POST({ request, cookies, getClientAddress }) {
    const body = await request.json() as unknown;

    if (!containsAccessToken(body)) {
        throw error(401, "Must include access token.");
    }

    handleRateLimiting(getClientAddress());

    const userInfo = await fetch(`${DISCORD_API_URL}/users/@me`, {
        headers: { 'Authorization': `Bearer ${body.discord_access_token}` }
    });
    const userInfoBody = await userInfo.json();

    if (userInfo.status !== 200 || !isDiscordUserInfo(userInfoBody)) {
        throw error(500, `Discord said no. Maybe refresh your access token. (${JSON.stringify(userInfoBody)})`);
    }

    if (!isValidJSONForScoreboardEntry(body)) {
        throw error(400, "Invalid data layout.");
    }

    var entry = new ScoreboardEntry(body);
    entry.player_id = userInfoBody.id;
    entry.playername = userInfoBody.global_name;

    detectImpossibleEntries(entry);
    detectObviousCheats(entry);

    let index = scores.findIndex((value, index, obj) => {
        return value.score < entry.score;
    });

    if (index == -1) {
        index = scores.length;
    }

    scores.splice(index, 0, entry);

    return json({ entry, place: index + 1 }, { status: 201 });
}

function readFile(path: string): string | undefined {
    if (!fs.existsSync(path)) {
        return undefined;
    }

    return fs.readFileSync(path, { encoding: "utf8" });
}
function writeFile(path: string, data: string) {
    return fs.writeFileSync(path, data, { encoding: "utf8" });
}