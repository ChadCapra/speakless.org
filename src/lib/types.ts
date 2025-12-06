// src/lib/types.ts

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

// Represents a COMPLETED shift
export type ShiftEntry = {
    period: number;
    playerNum: string;
    playerName: string;
    timeOn: string;  // e.g. "15:00"
    timeOff: string; // e.g. "14:15"
    durationSeconds: number;
};

export type AppState = {
    roster: Player[];
    onIce: Record<Position, Player | null>;
    // Track WHEN the current player went on ice (Game Time Seconds)
    shiftStarts: Record<Position, number | null>; 
    gameClock: GameClock;
    shiftLog: ShiftEntry[];
};
