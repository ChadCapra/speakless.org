<script lang="ts">
    import { appState } from '$lib/state.svelte.ts';
    import type { Position } from '$lib/types.ts';

    let { position } = $props<{ position: Position }>();

    // Filter roster for this position
    let positionPlayers = $derived(
        appState.roster.filter(p => p.position === position)
    );
    
    let currentPlayer = $derived(appState.onIce[position]);
    let startOfShift = $derived(appState.shiftStarts[position]);

    // --- LIVE DURATION CALCULATION ---
    // Game Clock counts DOWN. 
    // Duration = StartTime - CurrentTime.
    // e.g. Started at 15:00 (900s), Current is 14:00 (840s) -> 60s duration.
    let currentShiftDuration = $derived.by(() => {
        if (!currentPlayer || startOfShift === null) return 0;
        return startOfShift - appState.gameClock.time;
    });

    function formatDuration(seconds: number) {
        if (seconds < 0) return "0:00"; // Safety check
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // Helper to format 15:00 style
    function formatClock(seconds: number) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    function rotateNextPlayer() {
        if (positionPlayers.length === 0) return;
        const currentIndex = positionPlayers.findIndex(p => p.number === currentPlayer?.number);
        const nextIndex = (currentIndex + 1) % positionPlayers.length;
        changePlayer(positionPlayers[nextIndex]);
    }

    function handleSelectChange(event: Event) {
        const selectedNumber = (event.target as HTMLSelectElement).value;
        if (!selectedNumber) {
            changePlayer(null);
            return;
        }
        const newPlayer = appState.roster.find(p => p.number === selectedNumber);
        changePlayer(newPlayer!);
    }

    function changePlayer(newPlayer: (typeof appState.roster[0]) | null) {
        const oldPlayer = appState.onIce[position];
        const oldStart = appState.shiftStarts[position];
        const currentTime = appState.gameClock.time;

        // 1. If someone was on the ice, LOG THE COMPLETED SHIFT
        if (oldPlayer && oldStart !== null) {
            const duration = oldStart - currentTime;
            
            appState.shiftLog.push({
                period: appState.gameClock.period,
                playerNum: oldPlayer.number,
                playerName: oldPlayer.name,
                timeOn: formatClock(oldStart),
                timeOff: formatClock(currentTime),
                durationSeconds: duration
            });
        }

        // 2. Put new player on ice and RECORD START TIME
        appState.onIce[position] = newPlayer;
        
        if (newPlayer) {
            appState.shiftStarts[position] = currentTime;
        } else {
            appState.shiftStarts[position] = null;
        }
    }
</script>

<div class="player-slot">
    <div class="pos-label">{position}</div>
    
    <select onchange={handleSelectChange} value={currentPlayer?.number || ''}>
        <option value="">--</option>
        {#each positionPlayers as player}
            <option value={player.number}>
                #{player.number} {player.name}
            </option>
        {/each}
    </select>

    <div class="live-timer" class:long-shift={currentShiftDuration > 60}>
        {formatDuration(currentShiftDuration)}
    </div>

    <button onclick={rotateNextPlayer}>Next</button>
</div>

<style>
    .player-slot {
        display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
        background: #f4f4f4; padding: 10px; border-radius: 4px;
    }
    .pos-label { width: 30px; font-weight: bold; font-size: 1.1rem; }
    
    /* Make select take available space, but share with timer */
    select { flex-grow: 1; padding: 10px; font-size: 1.1rem; min-width: 0; }
    
    .live-timer {
        font-family: monospace;
        font-size: 1.2rem;
        padding: 5px 10px;
        background: #ddd;
        border-radius: 4px;
        min-width: 50px;
        text-align: center;
    }

    /* Visual cue if shift is over 60 seconds */
    .live-timer.long-shift {
        background: #ffcccc;
        color: #d00;
        font-weight: bold;
    }

    button { 
        padding: 10px 15px; font-size: 1rem; cursor: pointer; 
        background: #333; color: white; border: none; border-radius: 4px;
    }
</style>
