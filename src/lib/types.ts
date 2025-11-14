// src/lib/types.ts

// --- 1. Define the shapes of your data ---
export type Position = 'LW' | 'C' | 'RW' | 'LD' | 'RD';

export type Player = {
    number: string;
    name: string;
    position: Position;
};

export type GameClock = {
    time: number; // in seconds
    isRunning: boolean;
    period: number;
};

export type LogEntry = {
    timestamp: string;
    period: number;
    gameTime: number;
    event: 'ON' | 'OFF';
    player: Player | null; // Allow null for "Empty"
    position: Position;
};

// --- 2. Define the shape of the entire app ---
export type AppState = {
    roster: Player[];
    onIce: Record<Position, Player | null>;
    gameClock: GameClock;
    gameLog: LogEntry[];
};
