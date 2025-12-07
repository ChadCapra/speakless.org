<script lang="ts">
    import { appState, subPlayer, correctPlayer } from '$lib/state.svelte.ts';
    import { calculateDuration, formatTime } from '$lib/utils/time';
    import type { Position } from '$lib/types';

    let { position } = $props<{ position: Position }>();

    let sortedRoster = $derived([...appState.roster].sort((a, b) => {
        if (a.position === position && b.position !== position) return -1;
        if (a.position !== position && b.position === position) return 1;
        return parseInt(a.number) - parseInt(b.number);
    }));

    let currentPlayer = $derived(appState.onIce[position]);
    let startOfShift = $derived(appState.shiftStarts[position]);

    let currentShiftDuration = $derived.by(() => {
        if (!currentPlayer || startOfShift === null) return 0;
        return calculateDuration(startOfShift, appState.gameClock.time);
    });

    function handleCorrection(event: Event) {
        const selectedNumber = (event.target as HTMLSelectElement).value;
        const newPlayer = appState.roster.find(p => p.number === selectedNumber) || null;
        correctPlayer(position, newPlayer);
    }

    function rotateNext() {
        const positionPlayers = appState.roster.filter(p => p.position === position);
        if (positionPlayers.length === 0) return;

        const currentIdx = positionPlayers.findIndex(p => p.number === currentPlayer?.number);
        const nextIdx = (currentIdx + 1) % positionPlayers.length;
        
        subPlayer(position, positionPlayers[nextIdx]);
    }

    function sendToBench() {
        subPlayer(position, null);
    }
</script>

<div class="card">
    <div class="header">
        <span class="pos-badge">{position}</span>
        <div class="timer" class:warn={currentShiftDuration > 60}>
            {formatTime(currentShiftDuration)}
        </div>
    </div>
    
    <select onchange={handleCorrection} value={currentPlayer?.number || ''}>
        <option value="">(Empty / Penalty)</option>
        <optgroup label="Default {position}s">
            {#each sortedRoster.filter(p => p.position === position) as p}
                <option value={p.number}>#{p.number} {p.name}</option>
            {/each}
        </optgroup>
        <optgroup label="Others">
            {#each sortedRoster.filter(p => p.position !== position) as p}
                <option value={p.number}>#{p.number} {p.name}</option>
            {/each}
        </optgroup>
    </select>

    <div class="actions">
        <button class="bench-btn" onclick={sendToBench} title="Send to Bench / Pull Goalie">X</button>
        
        {#if position !== 'G'}
            <button class="next-btn" onclick={rotateNext}>Next</button>
        {/if}
    </div>
</div>

<style>
    .card {
        background: white; border: 1px solid #ccc; border-radius: 6px;
        padding: 5px; display: flex; flex-direction: column; gap: 5px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .pos-badge { font-weight: bold; background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.9rem;}
    .timer { font-family: monospace; font-size: 1.1rem; }
    .timer.warn { color: #d00; font-weight: bold; }
    
    select { padding: 8px; font-size: 1rem; border: 1px solid #ddd; border-radius: 4px; width: 100%;}
    
    .actions { display: flex; gap: 5px; }
    button { padding: 8px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold;}
    .next-btn { background: #333; color: white; flex-grow: 1; }
    .bench-btn { background: #ddd; color: #333; width: 40px; }
</style>
