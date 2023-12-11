import { error, json } from "@sveltejs/kit";
import { ScoreboardEntry, isValidJSONForScoreboardEntry } from "$lib/ScoreboardEntry";
import * as fs from "fs";
import { isDiscordUserInfo } from "$lib/discordAuth.js";
import { allGamemodes } from "$lib/Gamemode.js";
import { building } from "$app/environment";
import DatabaseConstructor, { type Database } from "better-sqlite3";

let db: Database;
let queries: Map<string, string> = new Map<string, string>();

if (!building) {
    db = new DatabaseConstructor("./data/db.sqlite");
    db.prepare(fs.readFileSync("./SQL/schema.sql", { encoding: "utf8" })).run();

    queries.set("getTopScores", fs.readFileSync("./SQL/getTopScores.sql", { encoding: "utf8" }));
    queries.set("insertScore", fs.readFileSync("./SQL/insertScore.sql", { encoding: "utf8" }));
    queries.set("getPlaceOfNewestScoreByPlayer", fs.readFileSync("./SQL/getPlaceOfNewestScoreByPlayer.sql", { encoding: "utf8" }));
    queries.set("getNumScores", fs.readFileSync("./SQL/getNumScores.sql", { encoding: "utf8" }));
    queries.set("getTopScoresOfGamemode", fs.readFileSync("./SQL/getTopScoresOfGamemode.sql", { encoding: "utf8" }));
    queries.set("getNumScoresOfGamemode", fs.readFileSync("./SQL/getNumScoresOfGamemode.sql", { encoding: "utf8" }));
}

function shutdownGracefully() {
    db.close();
    console.log("DB connection closed.");
    process.exit(0);
}

if (!building) {
    process.on('SIGINT', shutdownGracefully);
    process.on('SIGTERM', shutdownGracefully);
}

let submissions_on_cooldown: Map<string, Date> = new Map<string, Date>();

const MAX_OUT_OF_TIME_DIFFERENCE_MS = 1 * 60 * 60 * 1000; // 1 hour
const MAX_SCORE = 20_000;
const SUBMISSION_TIMEOUT_MS = 10 * 1000; // 1 minute
const MIN_PLAYERNAME_LENGTH = 4;


function handleRateLimiting(userID: string) {
    if (submissions_on_cooldown.get(userID) !== undefined) {
        let time_since_submission = (new Date().getTime() - submissions_on_cooldown.get(userID)!.getTime());

        if (time_since_submission < SUBMISSION_TIMEOUT_MS) {
            let time_left = (SUBMISSION_TIMEOUT_MS - time_since_submission) / 1000;
            throw error(429, `You can only submit scores every ${SUBMISSION_TIMEOUT_MS / 1000} seconds. (${time_left}s left)`);
        }
        else {
            // a new time will be set below
        }
    }

    submissions_on_cooldown.set(userID, new Date());
}

function detectObviousCheats(entry: ScoreboardEntry) {
    if (entry.score >= MAX_SCORE) {
        throw error(403, "Impossible submission.");
    }
}

function detectImpossibleEntries(entry: ScoreboardEntry) {
    if (entry.score < 500) {
        throw error(400, "Score is too low. Must be above 500.");
    }

    if (entry.username.length < MIN_PLAYERNAME_LENGTH) {
        throw error(400, `Player name is too short. Use at least ${MIN_PLAYERNAME_LENGTH} characters.`);
    }
}

export async function GET({ url }) {
    if (url.searchParams.get('n') === null) {
        throw error(400, `Request must include number of scores as query.`);
    }

    const o = parseInt(url.searchParams.get('o') ?? "0");
    const n = parseInt(url.searchParams.get('n')!);
    let gamemode = url.searchParams.get('gamemode');

    if (n > 500) {
        throw error(400, `Only request up to 500 scores at once.`);
    }
    if (gamemode === "global") {
        gamemode = null;
    }

    if (gamemode !== null) {
        if (!allGamemodes.includes(gamemode as any)) {
            throw error(400, `Gamemode must be one of ${allGamemodes.join(", ")}.`);
        }
    }

    let rows;

    if (gamemode === null) {
        rows = db.prepare(queries.get("getTopScores")!).all([o, n]);
    }
    else {
        rows = db.prepare(queries.get("getTopScoresOfGamemode")!).all([gamemode, o, n]);
    }

    let num_scores;
    if (gamemode === null) {
        num_scores = db.prepare(queries.get("getNumScores")!).get();
        num_scores = (num_scores as any)["COUNT(*)"];
    }
    else {
        num_scores = db.prepare(queries.get("getNumScoresOfGamemode")!).get([gamemode]);
        num_scores = (num_scores as any)["COUNT(*)"];
    }

    return json({ scores: rows, num_scores });
}

function containsAccessToken(obj: any): obj is { discord_access_token: string } {
    return typeof obj.discord_access_token === "string";
}

const DISCORD_API_URL: string = import.meta.env.VITE_DISCORD_API_URL;
export async function POST({ request, cookies, getClientAddress }) {
    var discord_access_token = request.headers.get("Authorization");
    if (!discord_access_token) {
        throw error(401, "Must include access token.");
    }
    discord_access_token = discord_access_token.split(" ")[1];

    const body = await request.json();

    
    const userInfo = await fetch(`${DISCORD_API_URL}/users/@me`, {
        headers: { 'Authorization': `Bearer ${discord_access_token}` }
    });
    const userInfoBody = await userInfo.json();

    if (userInfo.status !== 200 || !isDiscordUserInfo(userInfoBody)) {
        throw error(500, `Discord said no. Maybe refresh your access token. (${JSON.stringify(userInfoBody)})`);
    }
    handleRateLimiting(userInfoBody.id);

    if (!isValidJSONForScoreboardEntry(body)) {
        throw error(400, "Invalid data layout.");
    }

    var entry = new ScoreboardEntry(body);
    entry.user_id = userInfoBody.id;
    entry.username = userInfoBody.global_name;

    detectImpossibleEntries(entry);
    detectObviousCheats(entry);

    db.prepare(queries.get("insertScore")!).run([entry.username, entry.user_id, entry.score, entry.server_time.toISOString().slice(0, 19).replace('T', ' '), entry.gamemode]);

    entry.place = (db.prepare(queries.get("getPlaceOfNewestScoreByPlayer")!).get([entry.user_id]) as any)["place"];

    return json(entry, { status: 201 });
}