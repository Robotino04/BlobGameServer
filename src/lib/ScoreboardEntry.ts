class ScoreboardEntry{
    playername: string;
    score: number;
    time: Date;

    constructor(playername: string, score: number, time: Date){
        this.playername = playername;
        this.score = score;
        this.time = time;
    }
}