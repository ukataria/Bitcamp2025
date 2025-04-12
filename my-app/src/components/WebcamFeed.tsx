"use client";

import { useEffect, useRef } from "react";

export default function WebcamFeed({ isArmed, onCapture }: { isArmed: boolean; onCapture: (blob: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    });
  }, []);

  useEffect(() => {
    if (!isArmed) return;
    const interval = setInterval(() => {
      captureFrame();
    }, 4000); // every 4s

    return () => clearInterval(interval);
  }, [isArmed]);

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob); // send to parent
      }
    }, "image/jpeg");
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md border w-full max-w-2xl">
      <video ref={videoRef} autoPlay muted className="w-full h-auto" />
    </div>
  );
}
