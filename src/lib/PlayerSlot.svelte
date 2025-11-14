<script lang="ts">
    import { appState } from '$lib/state.svelte.ts';
    import type { Position } from '$lib/types.ts';

    // 1. THIS IS THE FIX: Use $props() to define props
    let { position } = $props<{ position: Position }>();

    // A derived value. This automatically updates if the roster changes.
    let positionPlayers = $derived(
        appState.roster.filter(p => p.position === position)
    );
    
    // A derived value for the current player
    let currentPlayer = $derived(appState.onIce[position]);

    /**
     * Handles the "Next" button click.
     */
    function rotateNextPlayer() {
        if (positionPlayers.length === 0) return;

        const currentIndex = positionPlayers.findIndex(p => p.number === currentPlayer?.number);
        const nextIndex = (currentIndex + 1) % positionPlayers.length;
        const newPlayer = positionPlayers[nextIndex];

        changePlayer(newPlayer);
    }

    /**
     * Handles changing the player from the dropdown.
     */
    function handleSelectChange(event: Event) {
        const selectedNumber = (event.target as HTMLSelectElement).value;
        if (!selectedNumber) {
            changePlayer(null); // Set to "Empty"
            return;
        }
        const newPlayer = appState.roster.find(p => p.number === selectedNumber);
        changePlayer(newPlayer!); // Using ! as we trust the find
    }

    /**
     * The single function that updates the state and logs the shift.
     */
    function changePlayer(newPlayer: (typeof appState.roster[0]) | null) {
        const oldPlayer = appState.onIce[position];
        const timestamp = new Date().toISOString();
        const { period, time } = appState.gameClock;

        if (oldPlayer) {
            appState.gameLog.push({
                timestamp, period, gameTime: time,
                event: 'OFF',
                player: oldPlayer,
                position
            });
        }
        if (newPlayer) {
            appState.gameLog.push({
                timestamp, period, gameTime: time,
                event: 'ON',
                player: newPlayer,
                position
            });
        }
        
        appState.onIce[position] = newPlayer;
    }
</script>

<div class="player-slot">
    <strong>{position}</strong>
    
    <select onchange={handleSelectChange} value={currentPlayer?.number || ''}>
        <option value="">-- Empty --</option>
        {#each appState.roster as player}
            <option value={player.number}>
                {player.number} - {player.name} ({player.position})
            </option>
        {/each}
    </select>
    
    <button onclick={rotateNextPlayer}>
        Next {position}
    </button>
</div>

<style>
    .player-slot {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        background: #f4f4f4;
        padding: 8px;
        border-radius: 4px;
    }
    .player-slot strong {
        width: 30px;
    }
    select {
        flex-grow: 1;
    }
</style>
