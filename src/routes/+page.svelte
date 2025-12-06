<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { 
        appState, 
        initializeStatePersistence, 
        clearShiftLog,
        nextPeriod 
    } from '$lib/state.svelte.ts';
    import PlayerSlot from '$lib/PlayerSlot.svelte';
    import type { Player } from '$lib/types.ts';

    let rosterText = $state('');
    let timerInterval: any = null;

    let clockMinutes = $derived(Math.floor(appState.gameClock.time / 60));
    let clockSeconds = $derived(appState.gameClock.time % 60);

    const MINUTE_OPTIONS = Array.from({ length: 21 }, (_, i) => 20 - i);
    const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => 59 - i);

    function updateTime(newMin: number, newSec: number) {
        appState.gameClock.time = (newMin * 60) + newSec;
    }

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
        if (appState.gameClock.isRunning) stopTimer();
        else startTimer();
    }

    function formatDuration(seconds: number) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // --- Actions ---
    function handleClearLog() {
        if (confirm("Are you sure you want to clear the shift log? (Make sure you copied it first!)")) {
            clearShiftLog();
        }
    }

    function handleNextPeriod() {
        if (confirm("End this period? This will log all current shifts, clear the ice, and reset the clock.")) {
            nextPeriod();
        }
    }

    // --- Roster Logic ---
    function loadRosterText() {
        rosterText = appState.roster.map(p => `${p.number},${p.name},${p.position}`).join('\n');
    }

    function saveRoster() {
        const parsedPlayers = rosterText.split('\n').filter(l => l.trim()).map(line => {
            const [num, name, pos] = line.split(',').map(s => s.trim());
            return { number: num, name: name, position: pos.toUpperCase() } as Player;
        });
        appState.roster = parsedPlayers;
        alert(`Roster saved!`);
    }

    onMount(() => {
        initializeStatePersistence();
        loadRosterText();
        if (appState.gameClock.isRunning) startTimer();
    });

    onDestroy(() => {
        if (timerInterval) clearInterval(timerInterval);
    });

    // --- CSV OUTPUT: SHIFTS ---
    let csvLogOutput = $derived.by(() => {
        const header = "Period,PlayerNum,PlayerName,TimeOn,TimeOff,Duration\n";
        const reversedLog = [...appState.shiftLog].reverse();
        
        const rows = reversedLog.map(entry => {
            const dur = formatDuration(entry.durationSeconds);
            return `${entry.period},${entry.playerNum},${entry.playerName},${entry.timeOn},${entry.timeOff},${dur}`;
        }).join('\n');
        return header + rows;
    });
</script>

<main>
    <div class="clock-controls">
        <div class="period-controls">
            <button onclick={() => appState.gameClock.period--}>-</button>
            <h2>Period {appState.gameClock.period}</h2>
            <button onclick={() => appState.gameClock.period++}>+</button>
        </div>

        <div class="clock-display" class:running={appState.gameClock.isRunning}>
            <select value={clockMinutes} onchange={(e) => updateTime(parseInt(e.currentTarget.value), clockSeconds)}>
                {#each MINUTE_OPTIONS as m}
                    <option value={m}>{m}</option>
                {/each}
            </select>
            <span class="colon">:</span>
            <select value={clockSeconds} onchange={(e) => updateTime(clockMinutes, parseInt(e.currentTarget.value))} >
                {#each SECOND_OPTIONS as s}
                    <option value={s}>{s < 10 ? '0'+s : s}</option>
                {/each}
            </select>
        </div>
        
        <div class="main-actions">
            <button class="start-stop-btn" onclick={toggleTimer}>
                {appState.gameClock.isRunning ? 'STOP' : 'START'}
            </button>
            
            <button class="next-period-btn" onclick={handleNextPeriod}>
                Next Period >>
            </button>
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

    <div class="log-output">
        <div class="log-header">
            <h3>Shift Log (CSV)</h3>
            <button class="clear-btn" onclick={handleClearLog}>Clear Log</button>
        </div>
        <textarea readonly rows="15">{csvLogOutput}</textarea>
    </div>

    <div class="roster-config">
        <details>
            <summary>Edit Roster / Lines</summary>
            <textarea bind:value={rosterText} rows="10"></textarea>
            <button onclick={saveRoster}>Save Roster</button>
        </details>
    </div>
</main>

<style>
    main { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 15px; padding-bottom: 50px;}
    
    .clock-controls {
        text-align: center; border: 2px solid #333; border-radius: 8px; padding: 10px;
        background: #222; color: white; margin-bottom: 20px;
    }
    .clock-display { display: flex; justify-content: center; align-items: center; margin: 10px 0; }
    .clock-display select {
        background: #333; color: white; border: none; font-size: 3.5rem;
        font-family: 'monospace'; appearance: none; padding: 0 10px; cursor: pointer; text-align: center;
    }
    .clock-display.running select { color: #0f0; }
    .colon { font-size: 3.5rem; margin: 0 5px; position: relative; top: -5px; }

    .period-controls { display: flex; justify-content: space-around; align-items: center; margin-bottom: 10px;}
    
    .main-actions { display: flex; gap: 10px; margin-top: 15px; }

    .start-stop-btn {
        flex: 2; padding: 15px; font-size: 1.2rem; font-weight: bold; cursor: pointer;
        background: #444; color: white; border: none; border-radius: 4px;
    }

    .next-period-btn {
        flex: 1; background: #004488; color: white; border: none; border-radius: 4px;
        font-weight: bold; cursor: pointer;
    }
    .next-period-btn:hover { background: #003366; }
    
    .on-ice-container, .roster-config, .log-output { margin-top: 30px; }
    textarea { width: 100%; box-sizing: border-box; font-family: monospace; }
    
    details { background: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    summary { cursor: pointer; font-weight: bold; }

    .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
    .clear-btn { background: #d00; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
    .clear-btn:hover { background: #b00; }
</style>
