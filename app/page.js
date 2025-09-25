"use client";
import React, { useState, useEffect, useRef } from "react";
import VoiceButton from "./components/VoiceButton";
import { FaClipboard, FaStop } from "react-icons/fa";


const Asistent = () => {
  const [isRecording, setIsRecording] = useState(true);
  const [results, setResults] = useState([0]);
  const [modalOpen, setModalOpen] = useState(true);
  const [modalContent, setModalContent] = useState("");
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices , setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const mediaRecorderRef = useRef(null);
  const handlerecording = () => {}

  const renderAnswer = () => {}

  let audioChunks = [];

  // Detect mobile device and initialize voices with mobile-specific handling
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log("Available voices:", voices.length);

        // More inclusive voice filtering for mobile compatibility
        const englishVoices = voices.filter(
          (voice) => voice.lang.includes("en") || voice.lang.includes("EN")
        );

        setAvailableVoices(englishVoices);

        // Set default voice with mobile-friendly fallback
        const defaultVoice =
          englishVoices.find(
            (voice) =>
              voice.name.includes("Google") ||
              voice.name.includes("Microsoft") ||
              voice.name.includes("Samantha") || // iOS default
              voice.name.includes("Samsung") || // Android Samsung
              voice.default
          ) || englishVoices[0];

        setSelectedVoice(defaultVoice);
      };

      // Mobile browsers need multiple attempts to load voices
      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();

      // Additional voice loading attempts for mobile
      setTimeout(loadVoices, 100);
      setTimeout(loadVoices, 500);
      setTimeout(loadVoices, 1000);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

    return(<>
        <div className="flex flex-col item-center justify-center min-h-screen bg-pink-300 p-2 sm:p-3">
            <div className="text-center mb-2 sm:mb-3 px-2">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 ">
                    AI Asistent
                </h1>

                <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6"> 
                    Click the Microphone to Ask a Question. Click it Again to Stop Recording.
                </p>

                { availableVoices.length > 0 && (
                    <div className="mb-4" >
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Select Voice:
                        </label>
                        <select 
                        value = {selectedVoice?.name || ""}
                        onChange={(e)=> 
                            setSelectedVoice(
                                availbleVoices.find((v)=> v.name===e.targetvalue))}

                                className="w-full max-w-xs p-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 foucus:ring-blue-500 focus:border-blue-500"
                        >
                            {availableVoices.map((voice) => (
                                <option key={voice.name} 
                                value= {voice.name}>
                                    {voice.name} {voice.lang} {voice.gender}
                                </option>
                            ))}
                        </select>
                        <p className=" text-xs text-gray-500 mt-1">{ availableVoices.length} Cricket Pundits avilble as of now.</p>
                    </div>
                )}
                 </div>
                 <div className="flex flex-col items-center space-y-4"> 
                    
                <VoiceButton onClick={handlerecording} isRecording={isRecording}></VoiceButton>

              {isSpeaking  &&  (<button onClick={stopspeaking} className="flex items-center space-x-2 bg-red-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg animate-pulse text-sm sm:text-base">

                    <FaStop size={isMobile ? 16:20} />
                    <span> Stop Speaking </span>

              </button>)}
                    
                     </div>

                     {isProcessing && !isSpeaking && (
                        <div className="text-center mt-4"> 
                        <p className="text-sm sm:text-lg text-gray-700"> Processing....</p>
                        <div className="animate-pulse bg-blue-200 h-2 w-48 "></div>
                        </div>
                     )}

                     {error && (<div className= "bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:py-3 rounded mt-4 max-w-sm sm:max-w-md  mx-2">
                        <p className="text-sm"> 
                            <strong> Error:</strong> {error}
                        </p>

                        <button onClick={()=> setError(null)} 
                        className="text-xs sm:text-sm underline mt-2"> 
                        Dismiss 
                        </button>

                     </div>
                    )}

                    {results.length > 0 && (
                        <div className=" w-full max-w-6xl mt-6 sm:mt-8 px-2">

                                <div className="hiddden sm:block overflow-x-auto shadow-lg rounded-lg"> 
                                    <table className="w-full text-sm text-left text-gray-600 bg-white">
                                        <thead className="text-xs text-gray-800 uppercase bg-gradient-to-r from blue-50 to-indigo-50 border-b-2 border-blue-200">
                                             <tr> 
                                                 <th scope="col" className="py-4 px-6 font-semibold"> Your Question</th>
                                                 <th scope="col" className="py-4 px-6 font-semibold"> AI RESPONSE</th>
                                                 <th scope="col" className="py-4 px-6 font-semibold"> Playback </th>
                                                 <th scope="col" className="py-4 px-6 font-semibold"> Actions</th>

                                             </tr>

                                        </thead>
                                        <tbody> {results.map((result, index)=> (
                                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                
                                                 <td className="py-4 px-6 "> 

                                                    {result.transcription?.length >70 ? `${result.transcription.substring(0,70)}...`: result.transcription}
                                                 </td>


                                                <td className="py-4 px-6 max-w-md">
                                                    {result.answer?.length > 100 ? (
                                                        <> { result.answer.substring(0,100)}... {""}
                                                         <button onClick={()=> handleModel(result.answer)}
                                                            className="text-blue-600 hover:underline">
                                                                    Read More
                                                         </button>
                                                        
                                                        </>
                                                    ) : (renderAnswer(result.answer))}

                                                    </td>  

                                                    <td className="py-4 px-6"> 
                                                        
                                                        <button onClick={() => handlePlayAudio(index)}
                                                            className={`${ 
                                                                result.isPlaying ? "bg-red-500" : "bg-green-500"} text-white font-bold py-2 px-4 rounded `}> {result.isPlaying ? "Stop" : "Play"}
                                                        </button></td>
                                                        <td className="py-4 px-6">
                                                        <button
                                                        onClick={()=> navigator.clipboard.writeText(result.answer)} 
                                                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded"> Copy 
                                                        </button>
                                                 </td>
                                                 </tr>
                                        ))} </tbody>
                                    </table>
                                </div>

                           {/* mb laY */}  

                           <div className=" sm:hidden space-y-4" > {results.map((result,index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-4 border">

                                <div className="mb-3">
                                    <h3 className="font-semibold text-gray-800 text-sm mb-1"> Your Question  </h3>
                                    <p className="text-gray-600 text-sm"> 
                                        {result.transcription?.length > 100 
                                        ? `${result.transcription.substring(0,100)}...` : result.transcription }
                                    </p>
                                </div>
                                <div className="mb-3">
                                    <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                        AI RESPONSE :
                                    </h3>
                                    <div className="text-gray-600 text-sm">
                                        {result.answer?.length > 150 ? (
                                            <>
                                            {result.answer.substring(0,150)}...{" "}

                                            <button onClick={()=> handleModel(result.answer)}
                                               className="text-blue-600 hover:underline font-medium" >
                                                Read More
                                               </button>
                                            </>
                                        ) : renderAnswer(result.answer)}
                                        

                                    </div>
                                     </div>

                                  <div classname= "flex flex-wrap gap-2"> 
                                    <button onClick={()=> handlePlayAudio(index) 
                                    }
                                    className={`${result.playing ? "bg-red-500" : "bg-green-500"} text-white font-bold py-2 px-3 rounded text-sm flex-1 min-w-20 `}
                                    >
                                        {result.playing ? "Stop" : "play"}
                                        </button>
                                         <button
                                              onClick={() =>
                                                   navigator.clipboard.writeText(result.answer)
                                                     }
                                              className="bg-blue-500 text-white font-bold py-2 px-3 rounded text-sm flex-1 min-w-20"
                                                        >
                                                    Copy
                                          </button>

                                        
                                        </div>   
                            </div>
                           ))} </div>   

                        </div>
                    )}
        </div>
   {/* mobile-optimized model*/}

   {modalOpen && (<div className="fixed top-0 left-0 w-full hifull bg-gray-900 bg-opacity-50 felx items-center justify-center z-50 p-2 sm:p-4">

   </div>)}

    </>)
}

export default Asistent;