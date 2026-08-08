import { useEffect, useRef, useState } from 'react';

interface AmbientNodes {
  context: AudioContext;
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
}

export function useAmbientSound() {
  const [enabled, setEnabled] = useState(false);
  const nodesRef = useRef<AmbientNodes | null>(null);

  useEffect(() => {
    if (!enabled) {
      const nodes = nodesRef.current;
      if (nodes) {
        nodes.gain.gain.setTargetAtTime(0, nodes.context.currentTime, 0.12);
        window.setTimeout(() => {
          nodes.sources.forEach((source) => {
            try { source.stop(); } catch { /* already stopped */ }
          });
          void nodes.context.close();
        }, 300);
        nodesRef.current = null;
      }
      return;
    }

    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) {
      setEnabled(false);
      return;
    }
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.035;
    master.connect(context.destination);

    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * (0.35 + Math.sin(index / 12000) * 0.15);
    }
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    noise.connect(filter).connect(master);

    const distantGun = context.createOscillator();
    const gunGain = context.createGain();
    distantGun.type = 'sine';
    distantGun.frequency.value = 42;
    gunGain.gain.value = 0.035;
    distantGun.connect(gunGain).connect(master);
    noise.start();
    distantGun.start();
    nodesRef.current = { context, gain: master, sources: [noise, distantGun] };

    return () => {
      noise.stop();
      distantGun.stop();
      void context.close();
      nodesRef.current = null;
    };
  }, [enabled]);

  return { enabled, toggle: () => setEnabled((value) => !value) };
}
