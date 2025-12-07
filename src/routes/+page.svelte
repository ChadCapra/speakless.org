<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { appState, initializePersistence, nextPeriod, clearLog } from '$lib/state.svelte.ts';
    import { generateCsv } from '$lib/logic/game';
    import PlayerSlot from '$lib/PlayerSlot.svelte';

    let timerInterval: any = null;

    let clockMinutes = $derived(Math.floor(appState.gameClock.time / 60));
    let clockSeconds = $derived(appState.gameClock.time % 60);
    
    const MINUTE_OPTIONS = Array.from({ length: 21 }, (_, i) => 20 - i);
    const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => 59 - i);

    let csvLogOutput = $derived(generateCsv(appState.shiftLog));

    function updateTime(min: number, sec: number) {
        appState.gameClock.time = (min * 60) + sec;
    }

    function toggleTimer() {
        if (appState.gameClock.isRunning) {
            appState.gameClock.isRunning = false;
            clearInterval(timerInterval);
        } else {
            appState.gameClock.isRunning = true;
            timerInterval = setInterval(() => {
                if (appState.gameClock.time > 0) appState.gameClock.time--;
                else toggleTimer();
            }, 1000);
        }
    }

    function handleNextPeriod() {
        if (confirm("End Period? Logs shifts, clears ice, resets clock.")) nextPeriod();
    }

    function handleClearLog() {
        if (confirm("Clear Log?")) clearLog();
    }

    onMount(() => {
        initializePersistence();
        if (appState.gameClock.isRunning) toggleTimer(); 
    });
    
    onDestroy(() => clearInterval(timerInterval));
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
                {#each MINUTE_OPTIONS as m} <option value={m}>{m}</option> {/each}
            </select>
            <span class="colon">:</span>
            <select value={clockSeconds} onchange={(e) => updateTime(clockMinutes, parseInt(e.currentTarget.value))} >
                {#each SECOND_OPTIONS as s} <option value={s}>{s < 10 ? '0'+s : s}</option> {/each}
            </select>
        </div>
        
        <div class="main-actions">
            <button class="start-stop-btn" onclick={toggleTimer}>
                {appState.gameClock.isRunning ? 'STOP' : 'START'}
            </button>
            <button class="next-period-btn" onclick={handleNextPeriod}>Next Period >></button>
        </div>
    </div>

    <div class="rink-layout">
        <div class="line-row forwards">
            <div class="slot"><PlayerSlot position="LW" /></div>
            <div class="slot"><PlayerSlot position="C" /></div>
            <div class="slot"><PlayerSlot position="RW" /></div>
        </div>
        <div class="line-row defense">
            <div class="slot"><PlayerSlot position="LD" /></div>
            <div class="slot"><PlayerSlot position="RD" /></div>
        </div>
        <div class="line-row goalie">
            <div class="slot"><PlayerSlot position="G" /></div>
        </div>
    </div>

    <div class="log-output">
        <div class="log-header">
            <h3>Shift Log (CSV)</h3>
            <button class="clear-btn" onclick={handleClearLog}>Clear Log</button>
        </div>
        <textarea readonly rows="15">{csvLogOutput}</textarea>
    </div>
</main>

<style>
    main { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 15px; padding-bottom: 50px;}
    .clock-controls { text-align: center; border: 2px solid #333; border-radius: 8px; padding: 10px; background: #222; color: white; margin-bottom: 20px; }
    .clock-display { display: flex; justify-content: center; align-items: center; margin: 10px 0; }
    .clock-display select { background: #333; color: white; border: none; font-size: 3.5rem; font-family: 'monospace'; appearance: none; padding: 0 10px; cursor: pointer; text-align: center; }
    .clock-display.running select { color: #0f0; }
    .colon { font-size: 3.5rem; margin: 0 5px; position: relative; top: -5px; }
    .period-controls { display: flex; justify-content: space-around; align-items: center; margin-bottom: 10px;}
    .main-actions { display: flex; gap: 10px; margin-top: 15px; }
    .start-stop-btn { flex: 2; padding: 15px; font-size: 1.2rem; font-weight: bold; cursor: pointer; background: #444; color: white; border: none; border-radius: 4px; }
    .next-period-btn { flex: 1; background: #004488; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
    .on-ice-container, .log-output { margin-top: 30px; }
    textarea { width: 100%; box-sizing: border-box; font-family: monospace; }
    .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
    .clear-btn { background: #d00; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }

    /* NEW LAYOUT STYLES */
    .rink-layout { background: #f0f8ff; border: 2px solid #2a4b8d; border-radius: 15px; padding: 15px; display: flex; flex-direction: column; gap: 15px; }
    .line-row { display: flex; justify-content: center; gap: 10px; }
    .slot { flex: 1; max-width: 33%; }
    .defense .slot { max-width: 45%; }
    .goalie .slot { max-width: 45%; }
</style>
