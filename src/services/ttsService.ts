let currentUpliftAudio: HTMLAudioElement | null = null;

export const speakWithUplift = async (text: string, voiceId: string, apiKey: string): Promise<void> => {
  stopUpliftTTS();

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await fetch('https://api.upliftai.org/v1/synthesis/text-to-speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId,
          outputFormat: 'MP3_22050_128',
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[TTS] Uplift API Error Output:', errText);
        throw new Error(`Uplift API failed with status: ${resp.status}`);
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      currentUpliftAudio = new Audio(url);

      currentUpliftAudio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };

      currentUpliftAudio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback failed'));
      };

      await currentUpliftAudio.play();
    } catch (e) {
      reject(e);
    }
  });
};

export const stopUpliftTTS = () => {
  if (currentUpliftAudio) {
    currentUpliftAudio.pause();
    currentUpliftAudio.currentTime = 0;
    currentUpliftAudio = null;
  }
};
