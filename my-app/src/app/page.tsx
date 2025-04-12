"use client";

import { useState } from "react";
import ArmToggle from "@/components/ArmToggle";
import WebcamFeed from "@/components/WebcamFeed";
import AlertTimeline from "@/components/AlertTimeline";

export default function HomePage() {
  const [isArmed, setIsArmed] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const fakeGeminiResponse = () => {
    const messages = [
      "Person entered room and took a bag.",
      "Suspicious movement detected near laptop.",
      "No threat detected.",
      "Alert: Person interacted with object on table.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleFrameCapture = (blob: Blob) => {
    // simulate processing time
    setTimeout(() => {
      const result = fakeGeminiResponse();
      if (result !== "No threat detected.") {
        setEvents((prev) => [...prev, result]);
      }
    }, 1500); // simulate Gemini latency
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-10 px-4 gap-6">
      <h1 className="text-3xl font-bold text-center">🏠 HomeGuard AI</h1>
      <ArmToggle onToggle={setIsArmed} />
      <WebcamFeed isArmed={isArmed} onCapture={handleFrameCapture} />
      <AlertTimeline events={events} />
    </main>
  );
}
