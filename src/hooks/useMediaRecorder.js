import { useCallback, useEffect, useRef, useState } from 'react';

const MIME_CANDIDATES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
const pickMime = () => MIME_CANDIDATES.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';

function describeError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera or microphone permission was denied. Allow access from the address bar, then try again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No camera or microphone was found. Connect one and try again.';
    case 'NotReadableError':
      return 'Your camera or microphone is being used by another app. Close it and try again.';
    default:
      return 'Could not start the camera and microphone in this browser.';
  }
}

// status: idle | requesting | ready | recording | recorded
export default function useMediaRecorder() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [url, setUrl] = useState('');
  const [ext, setExt] = useState('webm');
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const urlRef = useRef('');

  const supported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof window.MediaRecorder !== 'undefined';

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const clearUrl = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = '';
    setUrl('');
  }, []);

  const enable = useCallback(async () => {
    setError('');
    if (!supported) {
      setError('This browser does not support video recording. Try the latest Chrome, Edge, Firefox or Safari.');
      return false;
    }
    setStatus('requesting');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = s;
      setStream(s);
      setStatus('ready');
      return true;
    } catch (err) {
      setError(describeError(err));
      setStatus('idle');
      return false;
    }
  }, [supported]);

  const start = useCallback(() => {
    const s = streamRef.current;
    if (!s) return false;
    try {
      chunksRef.current = [];
      const mime = pickMime();
      const recorder = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mime || 'video/webm';
        const blobUrl = URL.createObjectURL(new Blob(chunksRef.current, { type }));
        urlRef.current = blobUrl;
        setUrl(blobUrl);
        setExt(type.includes('mp4') ? 'mp4' : 'webm');
        setStatus('recorded');
        release();
      };
      recorder.start();
      recorderRef.current = recorder;
      setStatus('recording');
      return true;
    } catch {
      setError('Recording could not start in this browser.');
      return false;
    }
  }, [release]);

  const stop = useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state !== 'inactive') r.stop();
  }, []);

  const discard = useCallback(() => {
    clearUrl();
    release();
    setError('');
    setStatus('idle');
  }, [clearUrl, release]);

  const retake = useCallback(() => {
    clearUrl();
    return enable();
  }, [clearUrl, enable]);

  useEffect(
    () => () => {
      const r = recorderRef.current;
      if (r && r.state !== 'inactive') {
        r.onstop = null;
        r.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  return { status, error, stream, url, ext, supported, enable, start, stop, retake, discard };
}
