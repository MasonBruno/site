const audio = document.getElementById('audioPlayer');
const playerBtn = document.getElementById('playerBtn');
const playerCurrentTime = document.getElementById('playerCurrentTime');
const playerDuration = document.getElementById('playerDuration');
const playerProgress = document.getElementById('playerProgress');
const progressWrapper = document.querySelector('.player-progress-wrapper');

let isSeeking = false;

function formatTime(seconds) {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateTime() {
    playerCurrentTime.textContent = formatTime(audio.currentTime);
    playerDuration.textContent = formatTime(audio.duration);
    const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    playerProgress.style.width = progress + '%';
}

function setPlayIcon() {
    playerBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function setPauseIcon() {
    playerBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
}

async function togglePlay() {
    if (audio.paused) {
        try {
            await audio.play();
            setPauseIcon();
        } catch (e) {}
    } else {
        audio.pause();
        setPlayIcon();
    }
}

function getSeekTime(clientX) {
    const rect = progressWrapper.getBoundingClientRect();
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return percent * audio.duration;
}

async function seekFromPointer(clientX, shouldPlay) {
    if (!isFinite(audio.duration)) return;
    audio.currentTime = getSeekTime(clientX);
    updateTime();
    if (shouldPlay && audio.paused) {
        try {
            await audio.play();
            setPauseIcon();
        } catch (e) {}
    }
}

progressWrapper.addEventListener('pointerdown', async (e) => {
    if (!isFinite(audio.duration)) return;
    isSeeking = true;
    progressWrapper.setPointerCapture(e.pointerId);
    await seekFromPointer(e.clientX, true);
});

progressWrapper.addEventListener('pointermove', async (e) => {
    if (!isSeeking) return;
    await seekFromPointer(e.clientX, false);
});

progressWrapper.addEventListener('pointerup', (e) => {
    isSeeking = false;
    try {
        progressWrapper.releasePointerCapture(e.pointerId);
    } catch (err) {}
});

progressWrapper.addEventListener('pointercancel', () => {
    isSeeking = false;
});

audio.addEventListener('timeupdate', updateTime);
audio.addEventListener('loadedmetadata', updateTime);
audio.addEventListener('ended', () => {
    setPlayIcon();
});
