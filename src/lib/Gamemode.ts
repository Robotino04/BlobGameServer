export const allGamemodes = ["classic", "toasted"] as const;
export type Gamemode = typeof allGamemodes[number];