import { json } from "@sveltejs/kit";

let scores: ScoreboardEntry[] = [];

export function GET() {
  return json({ scores });
}

export async function POST({ request, cookies }) {
  const body = await request.json();

  scores.push(body);

  return json({ scores }, { status: 201 });
}