// Short notification beep using the Web Audio API (no audio file needed).
export function playBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gain.gain.value = 0.05;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);

    oscillator.onended = () => context.close();
  } catch (error) {
    // Autoplay policies can block this before any user interaction — ignore.
  }
}
