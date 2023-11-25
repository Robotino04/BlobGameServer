import { error, json } from "@sveltejs/kit";
import { ScoreboardEntry, isValidJSONForScoreboardEntry } from "$lib/ScoreboardEntry";

let scores: ScoreboardEntry[] = [];

export function GET() {
  return json({ scores });
}

const MAX_OUT_OF_TIME_DIFFERENCE_MS = 1 * 60 * 60 * 1000; // 1 hour
const MAX_SCORE = 20_000;

function detectObviousCheats(entry: ScoreboardEntry){
  if (entry.score >= MAX_SCORE){
    throw error(403, "Impossible submission.");
  }
}

function detectImpossibleEntries(entry: ScoreboardEntry){
  if (Math.abs(entry.time.getTime() - new Date().getTime()) > MAX_OUT_OF_TIME_DIFFERENCE_MS){
    throw error(400, "Too out of date.");
  }
  
  if (entry.score <= 0){
    throw error(400, "Score cannot be <= 0.");
  }

  if (entry.playername.length < 3){
    throw error(400, "Player name is too short. Use at least 4 characters.");
  }
}

export async function POST({ request, cookies }) {
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