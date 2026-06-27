/* ===================================================
   NEXUS — Voice Module (Web Speech API)
   =================================================== */

const NexusVoice = (() => {
  const synth = window.speechSynthesis;
  let recognition = null;
  let isListening = false;

  // Initialize Speech Recognition
  function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    return rec;
  }

  // Text-to-Speech
  function speak(text, options = {}) {
    if (!synth || !NexusDB.getSettings().voice) return;
    synth.cancel();
    // Strip markdown for TTS
    const clean = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/#+\s/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[🎯💚💰🎨🌐📞💬🌐🚨]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.9;
    
    // Use a preferred voice if available
    const voices = synth.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Microsoft Aria'));
    if (preferred) utterance.voice = preferred;
    
    synth.speak(utterance);
    return utterance;
  }

  function stopSpeaking() {
    if (synth) synth.cancel();
  }

  // Speech-to-Text
  function startListening(onResult, onEnd, onError) {
    if (isListening) return;
    if (!recognition) recognition = initRecognition();
    if (!recognition) {
      if (onError) onError('Speech recognition not supported in this browser');
      return;
    }
    isListening = true;
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      if (onResult) onResult(transcript, event.results[event.results.length - 1].isFinal);
    };
    
    recognition.onerror = (event) => {
      isListening = false;
      if (onError) onError(event.error);
    };
    
    recognition.onend = () => {
      isListening = false;
      if (onEnd) onEnd();
    };
    
    try { recognition.start(); } catch (e) { isListening = false; }
  }

  function stopListening() {
    if (recognition && isListening) {
      recognition.stop();
      isListening = false;
    }
  }

  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  return { speak, stopSpeaking, startListening, stopListening, isListening: () => isListening, isSupported };
})();

window.NexusVoice = NexusVoice;
