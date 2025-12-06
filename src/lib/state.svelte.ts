// src/lib/state.svelte.ts
import { browser } from '$app/environment';
import type { AppState } from './types';

const defaultState: AppState = {
    // Your specific roster
    roster: [
		{ number: "14", name: "Hudson", position: "LD" },
        { number: "15", name: "Max", position: "RD" },
        { number: "67", name: "Brayden", position: "LD" },
        { number: "5", name: "Tyler", position: "RD" },
        { number: "9", name: "Griffin", position: "RW" },
        { number: "16", name: "Ryan", position: "C" },
        { number: "4", name: "Bo", position: "LW" },
        { number: "20", name: "Mason", position: "RW" },
        { number: "10", name: "Harper", position: "C" },
        { number: "11", name: "Tucker", position: "LW" },
        { number: "18", name: "JJ", position: "RW" },
        { number: "8", name: "Hawk", position: "C" },
        { number: "17", name: "Asher", position: "LW" }
    ],
    onIce: { LW: null, C: null, RW: null, LD: null, RD: null },
    // Initialize shift starts as null
    shiftStarts: { LW: null, C: null, RW: null, LD: null, RD: null },
    gameClock: { time: 15 * 60, isRunning: false, period: 1 },
    shiftLog: []
};

function loadState(): AppState {
    if (!browser) return defaultState;
    // Changed key to 'hockeyApp_v3' to clear old multi-team data
    const storedValue = localStorage.getItem('hockeyApp_v3'); 
    return storedValue ? JSON.parse(storedValue) : defaultState;
}

export const appState = $state(loadState());

export function initializeStatePersistence() {
    if (browser) {
        $effect(() => {
            localStorage.setItem('hockeyApp_v3', JSON.stringify(appState));
        });
    }
}
