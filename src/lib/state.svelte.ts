// src/lib/state.svelte.ts
import { browser } from '$app/environment';
import type { AppState } from './types';

// Default state definition (no change)
const defaultState: AppState = {
    roster: [
		{ number: "9", name: "Skildum", position: "LD" },
		{ number: "3", name: "O'Gara", position: "LW" },
		{ number: "22", name: "Lephew", position: "RW" },
		{ number: "14", name: "Dowdle", position: "RD" },
		{ number: "91", name: "Fredrickson", position: "C" },
		{ number: "12", name: "Capra", position: "LD" },
		{ number: "24", name: "Jacquez", position: "C" },
		{ number: "21", name: "Froistad", position: "RD" },
		{ number: "26", name: "Frison", position: "RW" },
		{ number: "19", name: "Cassleman", position: "LW" },
		{ number: "5", name: "Clem", position: "LW" }
	],
    onIce: {
        LW: null,
        C: null,
        RW: null,
        LD: null,
        RD: null
    },
    gameClock: {
        time: 15 * 60,
        isRunning: false,
        period: 1
    },
    gameLog: []
};

// loadState function (no change)
function loadState(): AppState {
    if (!browser) {
        return defaultState;
    }
    const storedValue = localStorage.getItem('hockeyApp');
    if (storedValue) {
        return JSON.parse(storedValue);
    }
    return defaultState;
}

// 1. State creation (no change)
// This is fine at the top level.
export const appState = $state(loadState());

// 2. THIS IS THE NEW PART: Wrap the effect in a function
// We will call this function from our page component.
export function initializeStatePersistence() {
    // The browser check is still important
    if (browser) {
        // This $effect will now be "owned" by whatever component calls this function
        $effect(() => {
            localStorage.setItem('hockeyApp', JSON.stringify(appState));
        });
    }
}
