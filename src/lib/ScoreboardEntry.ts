export interface ScoreboardEntryData {
    playername: string;
    score: number;
    time: string;
}

export class ScoreboardEntry{
    playername: string = "Empty Scoreboard Entry";
    score: number = 0;
    user_time: Date = new Date();
    server_time: Date = new Date();

    constructor(obj: ScoreboardEntryData){
        this.playername = obj.playername;
        this.score = obj.score;
        this.user_time = new Date(obj.time);
        this.server_time = new Date();
    }

}
export function isValidJSONForScoreboardEntry(json: any): json is ScoreboardEntryData{
    return (
        typeof json.playername === "string" &&
        typeof json.score === "number" &&
        typeof json.time === "string" && 
        !isNaN(Date.parse(json.time))
    );
}