import { browser } from '$app/environment';
import type { AppState, Position, Player } from './types';
import { DEFAULT_ROSTER } from '$lib/config/roster';
import { changePlayer, correctCurrentPlayer, logicNextPeriod } from '$lib/logic/game';

const initialState: AppState = {
    roster: DEFAULT_ROSTER,
    onIce: { LW: null, C: null, RW: null, LD: null, RD: null, G: null },
    shiftStarts: { LW: null, C: null, RW: null, LD: null, RD: null, G: null },
    gameClock: { time: 15 * 60, isRunning: false, period: 1 },
    shiftLog: []
};

function loadState(): AppState {
    if (!browser) return initialState;
    const stored = localStorage.getItem('hockey_v7'); 
    return stored ? JSON.parse(stored) : initialState;
}

export const appState = $state(loadState());

// --- ACTIONS ---

export function initializePersistence() {
    if (browser) {
        $effect(() => {
            localStorage.setItem('hockey_v6', JSON.stringify(appState));
        });
    }
}

export function subPlayer(pos: Position, newPlayer: Player | null) {
    changePlayer(appState, pos, newPlayer);
}

export function correctPlayer(pos: Position, correctPlayer: Player | null) {
    correctCurrentPlayer(appState, pos, correctPlayer);
}

export function nextPeriod() {
    logicNextPeriod(appState);
}

export function clearLog() {
    appState.shiftLog = [];
}
