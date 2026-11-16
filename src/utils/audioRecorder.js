// Lightweight browser MediaRecorder helper so kids can play back their own spoken recording

export async function startAudioClipRecorder() {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === 'undefined'
  ) {
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    const stopAndGetUrl = () =>
      new Promise((resolve) => {
        if (recorder.state === 'inactive') {
          stream.getTracks().forEach((t) => t.stop());
          resolve(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })) : null);
          return;
        }
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })) : null);
        };
        try {
          recorder.stop();
        } catch {
          stream.getTracks().forEach((t) => t.stop());
          resolve(null);
        }
      });

    recorder.start();
    return { stopAndGetUrl };
  } catch {
    return null;
  }
}
