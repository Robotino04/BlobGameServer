export const allGamemodes = ["classic", "toasted"] as const;
export type Gamemode = typeof allGamemodes[number];
export const gamemodeScoreMinima = { classic: 1000, toasted: 700 } as const;