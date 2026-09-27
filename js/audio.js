import { state } from './state.js';

export function initAudio() {
    if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        state.masterGain = state.audioCtx.createGain();
        state.masterGain.connect(state.audioCtx.destination);
        state.masterGain.gain.value = 0; 
    }
}

export function toggleMute() {
    initAudio();
    state.isMuted = !state.isMuted;
    document.getElementById('muteBtn').innerText = state.isMuted ? "🔈 Unmute" : "🔊 Mute";
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
    state.masterGain.gain.setValueAtTime(state.isMuted ? 0 : state.globalVolume, state.audioCtx.currentTime);
}

export function updateVolume(val) {
    state.globalVolume = parseFloat(val);
    if (!state.isMuted && state.masterGain) {
        state.masterGain.gain.setValueAtTime(state.globalVolume, state.audioCtx.currentTime);
    }
}

export function playShoot() {
    if (state.isMuted || !state.audioCtx) return;
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, state.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, state.audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, state.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, state.audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(state.masterGain);
    osc.start();
    osc.stop(state.audioCtx.currentTime + 0.15);
}

export function playSaucerShoot() {
    if (state.isMuted || !state.audioCtx) return;
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1000, state.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, state.audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, state.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, state.audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(state.masterGain);
    osc.start();
    osc.stop(state.audioCtx.currentTime + 0.2);
}

export function playBang(isLarge) {
    if (state.isMuted || !state.audioCtx) return;
    const dur = isLarge ? 0.3 : 0.15;
    const bufferSize = Math.floor(state.audioCtx.sampleRate * dur);
    const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = state.audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = state.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = isLarge ? 400 : 1000;

    const gain = state.audioCtx.createGain();
    gain.gain.setValueAtTime(isLarge ? 1 : 0.5, state.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, state.audioCtx.currentTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(state.masterGain);
    noise.start();
}

export function playSaucerSiren() {
    if (state.isMuted || !state.audioCtx) return;
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, state.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, state.audioCtx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, state.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, state.audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(state.masterGain);
    osc.start();
    osc.stop(state.audioCtx.currentTime + 0.25);
}
