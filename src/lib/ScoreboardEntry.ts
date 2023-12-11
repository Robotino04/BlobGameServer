import { allGamemodes, type Gamemode } from "./Gamemode";

export interface ScoreboardEntryData {
    playername: string;
    player_id: string;
    score: number;
    gamemode: Gamemode;
}

export class ScoreboardEntry{
    username: string = "Empty Scoreboard Entry";
    user_id: string = "No ID";
    score: number = 0;
    server_time: Date = new Date();
    place: number = -1;
    gamemode: Gamemode;

    constructor(obj: ScoreboardEntryData){
        this.score = obj.score;
        this.server_time = new Date();
        this.gamemode = obj.gamemode;
    }
}
export function isValidJSONForScoreboardEntry(json: any): json is ScoreboardEntryData{
    return (
        typeof json.score === "number" &&
        typeof json.gamemode === "string" && allGamemodes.includes(json.gamemode)
    );
}