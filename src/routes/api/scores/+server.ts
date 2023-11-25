import { error, json } from "@sveltejs/kit";
import { ScoreboardEntry, isValidJSONForScoreboardEntry } from "$lib/ScoreboardEntry";

let scores: ScoreboardEntry[] = [];

let submissions_on_cooldown: Map<string, Date> = new Map<string, Date>();

const MAX_OUT_OF_TIME_DIFFERENCE_MS = 1 * 60 * 60 * 1000; // 1 hour
const MAX_SCORE = 20_000;
const SUBMISSION_TIMEOUT_MS = 10 * 1000; // 1 minute
const MIN_PLAYERNAME_LENGTH = 4;


function handleRateLimiting(clientAddress: string){
  if (submissions_on_cooldown.get(clientAddress) !== undefined){
    let time_since_submission = (new Date().getTime() - submissions_on_cooldown.get(clientAddress)!.getTime());
    
    if (time_since_submission < SUBMISSION_TIMEOUT_MS){
      let time_left = (SUBMISSION_TIMEOUT_MS - time_since_submission) / 1000;
      throw error(429, `You can only submit scores every ${SUBMISSION_TIMEOUT_MS/1000} seconds. (${time_left}s left)`);
    }
    else{
      // a new time will be set below
    }
  }

  submissions_on_cooldown.set(clientAddress, new Date());
}

function detectObviousCheats(entry: ScoreboardEntry){
  if (entry.score >= MAX_SCORE){
    throw error(403, "Impossible submission.");
  }
}

function detectImpossibleEntries(entry: ScoreboardEntry){
  if (Math.abs(entry.user_time.getTime() - new Date().getTime()) > MAX_OUT_OF_TIME_DIFFERENCE_MS){
    throw error(400, "Too out of date.");
  }
  
  if (entry.score <= 0){
    throw error(400, "Score cannot be <= 0.");
  }

  if (entry.playername.length < MIN_PLAYERNAME_LENGTH){
    throw error(400, `Player name is too short. Use at least ${MIN_PLAYERNAME_LENGTH} characters.`);
  }
}


export function GET() {
  return json({ scores });
}

export async function POST({ request, cookies, getClientAddress }) {
  handleRateLimiting(getClientAddress());

  const body = await request.json() as unknown;

  if (!isValidJSONForScoreboardEntry(body)){
    throw error(400, "Invalid data layout.");
  }

  var entry = new ScoreboardEntry(body);

  detectImpossibleEntries(entry);
  detectObviousCheats(entry);

  scores.push(entry);

  return json({ scores }, { status: 201 });
}