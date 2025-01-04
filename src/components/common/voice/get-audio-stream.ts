export const getAudioStream = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const AudioContext =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  const getVolumeLevel = () => {
    analyser.getByteFrequencyData(dataArray);
    return dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  };

  return { getVolumeLevel };
};
