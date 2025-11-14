<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { appState, initializeStatePersistence } from '$lib/state.svelte.ts';
    import PlayerSlot from '$lib/PlayerSlot.svelte';

    let rosterText = $state('');
    
    onMount(() => {
		// This "anchors" the $effect to this page component, giving it a home.
        initializeStatePersistence();

        rosterText = appState.roster.map(p => `${p.number},${p.name},${p.position}`).join('\n');
    });

    function saveRoster() {
        appState.roster = rosterText
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const parts = line.split(',').map(s => s.trim());
                return {
                    number: parts[0],
                    name: parts[1],
                    // Force position to uppercase and cast as Position
                    position: parts[2].toUpperCase() as (typeof appState.onIce) extends Record<infer P, any> ? P : never
                };
            });
        alert('Roster Saved!');
    }

    // --- Timer Logic ---
    let timerInterval: any = null; // Use 'any' or 'NodeJS.Timeout'

    function startTimer() {
        if (appState.gameClock.isRunning) return;
        appState.gameClock.isRunning = true;

        timerInterval = setInterval(() => {
            if (appState.gameClock.time > 0) {
                appState.gameClock.time -= 1;
            } else {
                stopTimer();
            }
        }, 1000);
    }

    function stopTimer() {
        appState.gameClock.isRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function toggleTimer() {
        if (appState.gameClock.isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    }

    function adjustTime(amount: number) {
        appState.gameClock.time += amount;
    }

    function formatTime(seconds: number) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    onMount(() => {
        if (appState.gameClock.isRunning) {
            startTimer();
        }
    });

    onDestroy(() => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    });

    let logOutput = $derived(JSON.stringify(appState.gameLog, null, 2));

</script>

<main>
    <div class="clock-controls">
        <div class="period-controls">
            <button onclick={() => appState.gameClock.period--}>-</button>
            <h2>Period {appState.gameClock.period}</h2>
            <button onclick={() => appState.gameClock.period++}>+</button>
        </div>

        <button 
            type="button"
            class="clock" 
            onclick={toggleTimer} 
            class:running={appState.gameClock.isRunning}
        >
            {formatTime(appState.gameClock.time)}
        </button>
        
        <div class="time-adjust">
            <button onclick={() => adjustTime(-10)}>-10s</button>
            <button onclick={() => adjustTime(10)}>+10s</button>
        </div>
    </div>

    <div class="on-ice-container">
        <h3>On Ice</h3>
        <PlayerSlot position="LW" />
        <PlayerSlot position="C" />
        <PlayerSlot position="RW" />
        <PlayerSlot position="LD" />
        <PlayerSlot position="RD" />
    </div>

    <div class="roster-config">
        <h3>Roster (Number,Name,Position)</h3>
        <textarea bind:value={rosterText} rows="10" placeholder="18,Cooper,C&#10;22,Jones,C..."></textarea>
        <button onclick={saveRoster}>Save Roster</button>
    </div>

    <div class="log-output">
        <h3>Shift Log (for Copy/Paste)</h3>
        <textarea readonly rows="20">{logOutput}</textarea>
    </div>
</main>

<style>
    main {
        font-family: sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 15px;
    }
    .clock-controls {
        text-align: center;
        border: 2px solid #333;
        border-radius: 8px;
        padding: 10px;
    }
    .clock {
        /* This style block makes our <button> look like the old <h1> */
        font-size: 4em;
        font-family: 'monospace';
        margin: 10px 0;
        cursor: pointer;
        user-select: none;

        /* Reset button styles */
        background: none;
        border: none;
        color: inherit;
        padding: 0;
        width: 100%;
        text-align: center;
    }
    .clock.running {
        color: green;
    }
    .period-controls, .time-adjust {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    .on-ice-container, .roster-config, .log-output {
        margin-top: 30px;
    }
    textarea {
        width: 100%;
        box-sizing: border-box;
    }
</style>
