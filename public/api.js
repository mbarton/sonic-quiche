const __reservedSPApi = (function() {
    let sleepMultiplier = 0.5; // 120 BPM

    function send(action, data) {
        postMessage({ action, data});
    }

    function log(output) {
        send("log", output);
    }

    function complete() {
        send("complete", {});
    }

    function current_bpm() {
        return 60.0 / sleepMultiplier;
    }

    function use_bpm(bpm) {
        sleepMultiplier = 60.0 / bpm;
    }

    function with_bpm(bpm, block) {
        const saved = current_bpm();
        use_bpm(bpm);
        block();
        use_bpm(saved);
    }

    return {
        // Sonic Pi API functions
        current_bpm, use_bpm, with_bpm,
        // custom wiring functions
        log, complete
    }
})();