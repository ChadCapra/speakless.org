export type Position = 'LW' | 'C' | 'RW' | 'LD' | 'RD' | 'G';

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

export type ShiftEntry = {
    period: number;
    playerNum: string;
    playerName: string;
    timeOn: string;
    timeOff: string;
    durationSeconds: number;
    position: Position;
};

export type AppState = {
    roster: Player[];
    onIce: Record<Position, Player | null>;
    shiftStarts: Record<Position, number | null>;
    gameClock: GameClock;
    shiftLog: ShiftEntry[];
};
