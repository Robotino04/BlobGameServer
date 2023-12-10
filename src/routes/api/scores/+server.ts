import { error, json } from "@sveltejs/kit";
import { ScoreboardEntry, isValidJSONForScoreboardEntry } from "$lib/ScoreboardEntry";
import * as fs from "fs";
import { isDiscordUserInfo } from "$lib/discordAuth.js";
import sqlite3 from "sqlite3";
import { allGamemodes, gamemodeScoreMinima } from "$lib/Gamemode.js";
import { building } from "$app/environment";

const { Database } = sqlite3;

let db: sqlite3.Database;
let queries: {
    getTopScores: sqlite3.Statement;
    insertScore: sqlite3.Statement;
    getPlaceOfNewestScoreByPlayer: sqlite3.Statement;
    getNumScores: sqlite3.Statement;
    getTopScoresOfGamemode: sqlite3.Statement;
    getNumScoresOfGamemode: sqlite3.Statement;
};

if (!building){
    db = new Database("./data/db.sqlite", (err) => {
        if (err !== null) {
            console.error(`!! Database connection failed. (${err.message})`);
            return;
        }
        console.log('Connected to SQlite database.');

        db.run(fs.readFileSync("./SQL/schema.sql", { encoding: "utf8" }));
    });

    queries = {
        getTopScores: db.prepare(fs.readFileSync("./SQL/getTopScores.sql", { encoding: "utf8" })),
        insertScore: db.prepare(fs.readFileSync("./SQL/insertScore.sql", { encoding: "utf8" })),
        getPlaceOfNewestScoreByPlayer: db.prepare(fs.readFileSync("./SQL/getPlaceOfNewestScoreByPlayer.sql", { encoding: "utf8" })),
        getNumScores: db.prepare(fs.readFileSync("./SQL/getNumScores.sql", { encoding: "utf8" })),
        getTopScoresOfGamemode: db.prepare(fs.readFileSync("./SQL/getTopScoresOfGamemode.sql", { encoding: "utf8" })),
        getNumScoresOfGamemode: db.prepare(fs.readFileSync("./SQL/getNumScoresOfGamemode.sql", { encoding: "utf8" })),
    };
}

function shutdownGracefully() {
    db.close((err) => {
        if (err !== null) {
            console.error(`!! Closing DB connection failed. (${err.message})`);
            return;
        }
        console.log('Disconnected from SQlite database.');
    });
}

if (!building){
    process.on('SIGINT', shutdownGracefully);
    process.on('SIGTERM', shutdownGracefully);
}

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

    if (entry.score < gamemodeScoreMinima[entry.gamemode]) {
        throw error(400, "Score is too low.");
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
    if (gamemode === "global"){
        gamemode = null;
    }
    
    if (gamemode !== null) {
        if (!allGamemodes.includes(gamemode as any)) {
            throw error(400, `Gamemode must be one of ${allGamemodes.join(", ")}.`);
        }
    }

    let extractedRows = await new Promise<unknown[]>((resolve, reject) => {
        if (gamemode === null) {
            queries.getTopScores.all([o, n], (err, rows) => {
                if (err !== null) {
                    console.error(err.message);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        }
        else {
            queries.getTopScoresOfGamemode.all([gamemode, o, n], (err, rows) => {
                if (err !== null) {
                    console.error(err.message);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        }
    });

    let num_scores = await new Promise<unknown>((resolve, reject) => {
        if (gamemode === null) {
            queries.getNumScores.all((err, row: any) => {
                if (err !== null) {
                    console.error(err.message);
                    reject(err);
                    return;
                }
                resolve(row[0]["COUNT(*)"]);
            });
        }
        else {
            queries.getNumScoresOfGamemode.all([gamemode], (err, row: any) => {
                if (err !== null) {
                    console.error(err.message);
                    reject(err);
                    return;
                }
                resolve(row[0]["COUNT(*)"]);
            });
        }
    });

    return json({ scores: extractedRows, num_scores });
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
    entry.user_id = userInfoBody.id;
    entry.username = userInfoBody.global_name;

    detectImpossibleEntries(entry);
    detectObviousCheats(entry);

    db.wait()
    entry.place = await new Promise<number>((resolve, reject) => {
        db.serialize(() => {
            queries.insertScore.run([entry.username, entry.user_id, entry.score, entry.server_time.toISOString().slice(0, 19).replace('T', ' '), entry.gamemode]);

            queries.getPlaceOfNewestScoreByPlayer.get([entry.user_id], (err, row: any) => {
                if (err !== null) {
                    console.error(err.message);
                    reject(err);
                    return;
                }
                resolve(row["place"]);
            });
        });
    });

    return json(entry, { status: 201 });
}