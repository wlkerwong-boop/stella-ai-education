"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export default function VoiceInput({ onResult, className = "", size = "md" }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setUnsupported(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      if (text.trim()) {
        onResult(text);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        alert("请允许使用麦克风权限");
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  if (unsupported) {
    return (
      <button
        disabled
        className={`text-[#9a9590] cursor-not-allowed ${className}`}
        title="您的浏览器不支持语音输入（请使用Chrome或Edge）"
      >
        <MicOff className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
      </button>
    );
  }

  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      className={`shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
        listening
          ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
          : "bg-[#f0ece7] text-[#8b7355] hover:bg-[#e8e4df] hover:text-[#c4753f]"
      } ${size === "sm" ? "w-8 h-8" : "w-10 h-10"} ${className}`}
      title={listening ? "点击停止录音" : "点击开始语音输入"}
    >
      {listening ? (
        <span className="relative">
          <Mic className={sizeClass} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
        </span>
      ) : (
        <Mic className={sizeClass} />
      )}
    </button>
  );
}
