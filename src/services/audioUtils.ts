
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const playAudio = (base64Audio: string, audioElement: HTMLAudioElement | null, volume: number = 100): void => {
  try {
    if (!audioElement) return;
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mp3' });
    
    // Create object URL and play
    const url = URL.createObjectURL(blob);
    
    audioElement.volume = volume / 100;
    audioElement.src = url;
    audioElement.play();
    
    // Clean up URL after playing
    audioElement.onended = () => {
      URL.revokeObjectURL(url);
    };
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};
