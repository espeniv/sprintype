import { useState, useEffect } from "react";

interface WordProps {
  spelling: string;
  startPos: number;
  timer: number;
}

export default function Word({ spelling, startPos, timer }: WordProps) {
  const animationDuration = `${timer / 1000}s`;

  const [falling, setFalling] = useState(false);

  useEffect(() => {
    // Trigger the animation after the component mounts
    const timeout = setTimeout(() => setFalling(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      style={{
        fontSize: "30px",
        position: "absolute",
        left: `${startPos}%`, // Horizontal position
        top: falling ? "100%" : "0%", // Animate from top to bottom
        transition: `top ${animationDuration} linear`, // Smooth falling animation
      }}
    >
      {spelling}
    </div>
  );
}
