// src/lib/state.svelte.ts
import { browser } from '$app/environment';
import type { AppState, Position } from './types';

const defaultState: AppState = {
    // UPDATED ROSTER
    roster: [
        { number: "15", name: "Max", position: "LD" },
        { number: "14", name: "Hudson", position: "RD" },
        { number: "5", name: "Tyler", position: "LD" },
        { number: "67", name: "Brayden", position: "RD" },
        { number: "4", name: "Bo", position: "LW" },
        { number: "16", name: "Ryan", position: "C" },
        { number: "9", name: "Griffin", position: "RW" },
        { number: "17", name: "Asher", position: "LW" },
        { number: "8", name: "Hawk", position: "C" },
        { number: "18", name: "JJ", position: "RW" },
        { number: "20", name: "Mason", position: "LW" },
        { number: "10", name: "Harper", position: "C" },
        { number: "11", name: "Tucker", position: "RW" }
    ],
    onIce: { LW: null, C: null, RW: null, LD: null, RD: null },
    shiftStarts: { LW: null, C: null, RW: null, LD: null, RD: null },
    gameClock: { time: 15 * 60, isRunning: false, period: 1 },
    shiftLog: []
};

function loadState(): AppState {
    if (!browser) return defaultState;
    // Updated key to v4 to ensure this new roster loads immediately
    const storedValue = localStorage.getItem('hockeyApp_v4'); 
    return storedValue ? JSON.parse(storedValue) : defaultState;
}

export const appState = $state(loadState());

// Helper for formatting time in the log (e.g. "12:30")
function formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

export function clearShiftLog() {
    appState.shiftLog = [];
}

export function nextPeriod() {
    const POSITIONS: Position[] = ['LW', 'C', 'RW', 'LD', 'RD'];
    const currentTime = appState.gameClock.time;

    // 1. Close out all active shifts
    POSITIONS.forEach(pos => {
        const player = appState.onIce[pos];
        const startTime = appState.shiftStarts[pos];

        if (player && startTime !== null) {
            // Calculate final shift duration up to this moment
            const duration = startTime - currentTime;

            appState.shiftLog.push({
                period: appState.gameClock.period,
                playerNum: player.number,
                playerName: player.name,
                timeOn: formatTime(startTime),
                timeOff: formatTime(currentTime),
                durationSeconds: duration
            });
        }
    });

    // 2. Clear the Ice and Reset Start Times
    appState.onIce = { LW: null, C: null, RW: null, LD: null, RD: null };
    appState.shiftStarts = { LW: null, C: null, RW: null, LD: null, RD: null };

    // 3. Reset Clock and Increment Period
    appState.gameClock.isRunning = false;
    appState.gameClock.time = 15 * 60; // Reset to 15:00
    appState.gameClock.period += 1;
}

export function initializeStatePersistence() {
    if (browser) {
        $effect(() => {
            localStorage.setItem('hockeyApp_v4', JSON.stringify(appState));
        });
    }
}
