import { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { parseVoiceInput } from '../store/taskSlice';
import type { ParsedVoiceInput } from '../types/task';

interface VoiceInputProps {
  onParsed: (parsed: ParsedVoiceInput) => void;
  onError: (error: string) => void;
}

export default function VoiceInput({ onParsed, onError }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error === 'no-speech') {
        onError('No speech detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        onError('No microphone found. Please check your microphone settings.');
      } else {
        onError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      
      // Auto-process if we have a transcript
      if (transcript.trim() && !isProcessing) {
        handleProcess();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript, isProcessing, onError]);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        onError('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const handleProcess = async () => {
    if (!transcript.trim()) {
      onError('No transcript to process. Please record something first.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await dispatch(parseVoiceInput(transcript.trim())).unwrap();
      onParsed(result);
      setTranscript('');
    } catch (error: any) {
      onError(error.message || 'Failed to parse voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center
            smooth-transition
            ${isRecording
              ? 'bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 animate-pulse shadow-xl'
              : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover-lift'}
            shadow-lg
          `}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? (
            <>
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
              </svg>
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
            </>
          ) : (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <p className="text-sm font-medium text-gray-600">
          {isRecording ? 'Recording... Click to stop' : isProcessing ? 'Processing...' : 'Click to start recording'}
        </p>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-purple-600">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
            <span className="font-medium">Processing your voice...</span>
          </div>
        )}
      </div>

      {transcript && (
        <div className="w-full max-w-md p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-semibold text-gray-700">Transcript:</p>
          </div>
          <p className="text-gray-800 mb-4 leading-relaxed">{transcript}</p>
          {!isRecording && !isProcessing && (
            <button
              onClick={handleProcess}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 smooth-transition font-medium shadow-md hover-lift flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Process & Create Task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

