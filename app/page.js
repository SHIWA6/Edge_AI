"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import VoiceButton from "./components/VoiceButton";
import { FaStop, FaClipboard } from "react-icons/fa";
import { API_BASE_URL } from "./apiConfig";

const Asistent = () => {
     const [isRecording, setIsRecording] = useState(false);
    const [results, setResults] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
      const [modalContent, setModalContent] = useState("");
     const [error, setError] = useState(null);
   const [isProcessing, setIsProcessing] = useState(false);
     const [isSpeaking, setIsSpeaking] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
       const [isMobile, setIsMobile] = useState(false);
        const mediaRecorderRef = useRef(null);
           let audioChunks = [];

  useEffect(() => { const checkMobile = () => { const mobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent);
      setIsMobile(mobile);
    };
        checkMobile();
                 window.addEventListener("resize", checkMobile);

                if ("speechSynthesis" in window) {
                     const loadVoices = () => {
                         const voices = speechSynthesis.getVoices();
        console.log("Available voices:", voices.length);
        
        const englishVoices = voices.filter((voice) => 
          voice.lang.includes("en") || voice.lang.includes("EN")
        );
                    setAvailableVoices(englishVoices);
        
        const defaultVoice =
          englishVoices.find(
            (voice) =>
                         voice.name.includes("Google") ||
                                 voice.name.includes("Microsoft") ||
                                        voice.name.includes("Samantha") ||
                                                  voice.name.includes("Samsung") ||
                                                           voice.default
          ) || englishVoices[0];
        setSelectedVoice(defaultVoice);
      };
      
      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
      setTimeout(loadVoices, 100);
      setTimeout(loadVoices, 500);
      setTimeout(loadVoices, 1000);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setResults((prev) =>
      prev.map((r) => ({ ...r, isPlaying: false }))
    );
  };

  const createAudioProcessor = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
                analyser.fftSize = 2048;
                analyser.smoothingTimeConstant = 0.8;
                    source.connect(analyser);

       const bufferLength = analyser.frequencyBinCount;
     const dataArray = new Uint8Array(bufferLength);
      let silenceStart = Date.now();
      const SILENCE_THRESHOLD = 30;
         const SILENCE_DURATION = 1500;

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      if (average < SILENCE_THRESHOLD) {
        if (Date.now() - silenceStart > SILENCE_DURATION && isRecording) {
          stopRecording();
        }
      } else {
        silenceStart = Date.now();
      }

      if (isRecording) requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
    return audioContext;
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsProcessing(true);
    setError(null);

    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: isMobile ? 16000 : 44100,
        channelCount: 1,
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true,
        googAudioMirroring: false,
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        const audioContext = createAudioProcessor(stream);

        let mimeType = "audio/webm;codecs=opus";
        if (isMobile) {
          if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
          else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
          else if (MediaRecorder.isTypeSupported("audio/ogg")) mimeType = "audio/ogg";
        }

        const options = { mimeType };
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        mediaRecorderRef.current.start();

        const timeout = isMobile ? 20000 : 30000;
        setTimeout(() => {
          if (mediaRecorderRef.current?.state === "recording") stopRecording();
        }, timeout);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          audioChunks = [];

          if (audioBlob.size > 1000) {
            handleTranscription(URL.createObjectURL(audioBlob), audioBlob);
          } else {
            setIsProcessing(false);
            console.log("Recording too short or silent");
          }

          stream.getTracks().forEach((track) => track.stop());
          if (audioContext) audioContext.close();
        };
      })
      .catch((err) => {
        console.error("Microphone access error:", err);
        setError("Could not access microphone. Please check permissions and try again.");
        setIsProcessing(false);
        setIsRecording(false);
      });
  };

  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      stopSpeaking();
      startRecording();
    }
  };
  const handleTranscription = async (audioUrl, audioBlob) => {
    const formData = new FormData();
    formData.append("audioData", audioBlob);

    try {
      const resTrans = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: "POST",
    body: formData,
      });
      if (!resTrans.ok) throw new Error("Transcription failed");
      const data = await resTrans.json();
      const transcription = data.text;

                    const resAnswer = await fetch(`${API_BASE_URL}/api/answer`, {
                    method: "POST",
                       headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: transcription }),
      });
      if (!resAnswer.ok) throw new Error("Failed to get answer");
                const answerData = await resAnswer.json();
      
     
                     const answerText = answerData.answer || answerData.response || "No response available";
      
      const newResult = {
        transcription,
        audioUrl,
        answer: answerText,
        isPlaying: false,
      };
      
      setResults((prev) => [newResult, ...prev]);
      handleBrowserTTS(answerText);
      
    } 
    
    catch (err) {
      console.error("Transcription/Answer error:", err);
      setError("Failed to process audio. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleBrowserTTS = (text) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      
      setTimeout(() => {
        setIsSpeaking(true);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = isMobile ? 0.9 : 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setIsProcessing(false);
        };
        
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event.error);
          setIsSpeaking(false);
          setIsProcessing(false);
        };
        
        speechSynthesis.speak(utterance);
      }, 100);
    } else {
      console.error("Speech synthesis not supported.");
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = (index) => {
    const result = results[index];
    if (!result) return;

    if (result.isPlaying) {
      stopSpeaking();
    } else {
      stopSpeaking();
      setIsSpeaking(true);
      setResults((prev) =>
        prev.map((r, i) => ({ ...r, isPlaying: i === index }))
      );

      const utterance = new SpeechSynthesisUtterance(result.answer);
      utterance.rate = isMobile ? 0.9 : 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onend = () => {
        setIsSpeaking(false);
        setResults((prev) =>
          prev.map((r, i) => (i === index ? { ...r, isPlaying: false } : r))
        );
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
        setResults((prev) =>
          prev.map((r, i) => (i === index ? { ...r, isPlaying: false } : r))
        );
      };

      speechSynthesis.speak(utterance);
    }
  };

  const handleModal = (text) => {
    setModalContent(text);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const renderAnswer = (answer) => {
    if (typeof answer === "string") {
      return <p className="text-gray-800">{answer}</p>;
    }
    return <p className="text-gray-500">No response available</p>;
  };

  return (
   <>
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100/60 via-indigo-200/60 to-purple-300/40 backdrop-blur-2xl p-4 sm:p-6">
    <div className="text-center mb-4 sm:mb-6 px-2">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 drop-shadow-lg tracking-tight">
        AI Assistant
      </h1>
      <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
        Click the microphone to ask a question, then click again to stop recording.
      </p>

      {availableVoices.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2 tracking-wide">
            Select Voice:
          </label>
          <select
            value={selectedVoice?.name || ""}
            onChange={(e) =>
              setSelectedVoice(
                availableVoices.find((v) => v.name === e.target.value)
              )
            }
            className="w-full max-w-xs p-3 text-sm font-medium border border-gray-200 rounded-xl bg-white/70 shadow-md backdrop-blur-md text-gray-700 focus:ring-4 focus:ring-indigo-300 focus:border-indigo-400 transition duration-200 ease-in-out"
          >
            {availableVoices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2 italic">
            {availableVoices.length} voices available
          </p>
        </div>
      )}
    </div>

    {/* Main Controls */}
    <div className="flex flex-col items-center space-y-5">
      <VoiceButton
        onClick={handleRecording}
        isRecording={isRecording}
        className="transition transform hover:scale-105"
      />

      {isSpeaking && (
        <button
          onClick={stopSpeaking}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2.5 px-6 sm:py-3 sm:px-8 rounded-full shadow-lg animate-pulse text-sm sm:text-base backdrop-blur-md transition-all duration-200"
        >
          <FaStop size={isMobile ? 16 : 20} />
          <span>Stop Speaking</span>
        </button>
      )}
    </div>
    {isProcessing && !isSpeaking && (
      <div className="text-center mt-6">
        <p className="text-base sm:text-lg font-medium text-gray-800 animate-pulse">
          Processing...
        </p>
        <div className="animate-pulse bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 h-2 w-52 sm:w-64 mx-auto mt-3 rounded-full shadow-md"></div>
      </div>
    )}
    {error && (
      <div className="bg-red-100/80 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-6 max-w-sm sm:max-w-md mx-2 shadow-lg backdrop-blur-md">
        <p className="text-sm font-medium">
          <strong>Error:</strong> {error}
        </p>
        <button
          onClick={() => setError(null)}
          className="text-xs sm:text-sm underline mt-2 text-red-600 hover:text-red-800 transition"
        >
          Dismiss
        </button>
      </div>
    )}
    {results.length > 0 && (
      <div className="w-full max-w-6xl mt-8 sm:mt-12 px-3">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto shadow-2xl rounded-2xl backdrop-blur-md">
          <table className="w-full text-sm text-left text-gray-700 bg-white/80 border border-gray-200 rounded-lg overflow-hidden">
            <thead className="text-xs text-gray-900 uppercase bg-gradient-to-r from-indigo-100 to-purple-100 border-b-2 border-indigo-200">
              <tr>
                <th scope="col" className="py-4 px-6 font-semibold">Your Question</th>
                <th scope="col" className="py-4 px-6 font-semibold">AI Response</th>
                <th scope="col" className="py-4 px-6 font-semibold">Playback</th>
                <th scope="col" className="py-4 px-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr
                  key={index}
                  className="bg-white/60 border-b hover:bg-indigo-50/70 transition"
                >
                  <td className="py-4 px-6">
                    {result.transcription?.length > 70
                      ? `${result.transcription.substring(0, 70)}...`
                      : result.transcription}
                  </td>
                  <td className="py-4 px-6 max-w-md">
                    {result.answer?.length > 100 ? (
                      <>
                        {result.answer.substring(0, 100)}...{" "}
                        <button
                          onClick={() => handleModal(result.answer)}
                          className="text-indigo-600 hover:underline font-medium"
                        >
                          Read More
                        </button>
                      </>
                    ) : (
                      renderAnswer(result.answer)
                    )}
                  </td>
                  <td className="py-4 px-6">
           <button
                      onClick={() => handlePlayAudio(index)}
                      className={`${
              result.isPlaying
                          ? "bg-gradient-to-r from-red-500 to-pink-500"
                          : "bg-gradient-to-r from-green-500 to-emerald-500"
                      } text-white font-semibold py-2 px-5 rounded-full shadow-md transition transform hover:scale-105`}
                    >
                      {result.isPlaying ? "Stop" : "Play"}
                    </button>
                  </td>
       <td className="py-4 px-6">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(result.answer)
                     }
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-5 rounded-full shadow-md transition transform hover:scale-105"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden space-y-5">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white/80 rounded-2xl shadow-xl p-4 border border-gray-200 backdrop-blur-lg"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Your Question:
                </h3>
                <p className="text-gray-700 text-sm">
                  {result.transcription?.length > 100
                    ? `${result.transcription.substring(0, 100)}...`
                    : result.transcription}
                </p>
              </div>

              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  AI Response:
                </h3>
                <div className="text-gray-700 text-sm leading-relaxed">
                  {result.answer?.length > 150 ? (
                    <>
                      {result.answer.substring(0, 150)}...{" "}
                      <button
                        onClick={() => handleModal(result.answer)}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Read More
                      </button>
                    </>
                  ) : (
                    renderAnswer(result.answer)
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handlePlayAudio(index)}
                  className={`${
                    result.isPlaying
                      ? "bg-gradient-to-r from-red-500 to-pink-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  } text-white font-semibold py-2 px-4 rounded-lg text-sm flex-1 min-w-20 shadow-md transition transform hover:scale-105`}
                >
                  {result.isPlaying ? "Stop" : "Play"}
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(result.answer)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg text-sm flex-1 min-w-20 shadow-md transition transform hover:scale-105"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  {modalOpen && (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900/70 flex items-center justify-center z-50 p-3 sm:p-6">
      <div className="bg-white/90 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-2 backdrop-blur-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Full Text
          </h2>
          <button
            onClick={() => navigator.clipboard.writeText(modalContent)}
            className="text-indigo-600 hover:text-indigo-800 transition p-2"
          >
            <FaClipboard size={18} />
          </button>
        </div>
        <div className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
          {renderAnswer(modalContent)}
        </div>
        <button
          onClick={closeModal}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold mt-6 py-2.5 px-6 rounded-full shadow-md mx-auto block w-full sm:w-auto hover:scale-105 transition"
        >
          Close
        </button>
      </div>
    </div>
  )}
</>

  );
};

export default Asistent;