"use client";
import { useState } from "react";

export default function ArmToggle({ onToggle }: { onToggle: (armed: boolean) => void }) {
  const [armed, setArmed] = useState(false);

  const handleClick = () => {
    const newState = !armed;
    setArmed(newState);
    onToggle(newState);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-2 rounded-lg text-white font-semibold ${
        armed ? "bg-red-600" : "bg-green-600"
      }`}
    >
      {armed ? "Disarm" : "Arm System"}
    </button>
  );
}
