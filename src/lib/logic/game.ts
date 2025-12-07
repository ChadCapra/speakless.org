import type { AppState, Position, Player } from '$lib/types';
import { formatTime, calculateDuration } from '$lib/utils/time';

// --- CSV Generation ---
export function generateCsv(shiftLog: AppState['shiftLog']): string {
    const header = "Period,PlayerNum,PlayerName,TimeOn,TimeOff,Duration,Pos\n";
    const rows = [...shiftLog].reverse().map(entry => {
        const dur = formatTime(entry.durationSeconds);
        return `${entry.period},${entry.playerNum},${entry.playerName},${entry.timeOn},${entry.timeOff},${dur},${entry.position}`;
    }).join('\n');
    return header + rows;
}

// --- LOGIC ---

// HOT SWAP: Corrects the player name WITHOUT ending the shift timer
export function correctCurrentPlayer(state: AppState, pos: Position, correctPlayer: Player | null) {
    state.onIce[pos] = correctPlayer;
}

// LINE CHANGE: Ends the current shift and starts a new timer
export function changePlayer(state: AppState, pos: Position, newPlayer: Player | null) {
    const oldPlayer = state.onIce[pos];
    const startTime = state.shiftStarts[pos];
    const currentTime = state.gameClock.time;

    // 1. Log completed shift
    if (oldPlayer && startTime !== null) {
        const duration = calculateDuration(startTime, currentTime);
        if (duration > 1) { // Only log if > 1 second
            state.shiftLog.push({
                period: state.gameClock.period,
                playerNum: oldPlayer.number,
                playerName: oldPlayer.name,
                timeOn: formatTime(startTime),
                timeOff: formatTime(currentTime),
                durationSeconds: duration,
                position: pos
            });
        }
    }

    // 2. Put new player on ice
    state.onIce[pos] = newPlayer;

    // 3. Start new timer (if player exists)
    state.shiftStarts[pos] = newPlayer ? currentTime : null;
}

export function logicNextPeriod(state: AppState) {
    const POSITIONS: Position[] = ['LW', 'C', 'RW', 'LD', 'RD', 'G'];
    POSITIONS.forEach(pos => changePlayer(state, pos, null)); // Close everyone out

    state.gameClock.isRunning = false;
    state.gameClock.time = 15 * 60; 
    state.gameClock.period += 1;
}
