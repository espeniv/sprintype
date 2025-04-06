import { useState, useEffect } from "react";

interface WordProps {
  spelling: string;
  startPos: number;
  timer: number;
  currentInput: string;
}

export default function Word({
  spelling,
  startPos,
  timer,
  currentInput,
}: WordProps) {
  const animationDuration = `${timer / 1000}s`;

  const [falling, setFalling] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setFalling(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  const matchedIndex = currentInput
    .toLowerCase()
    .split("")
    .findIndex((_, index) =>
      spelling.toLowerCase().startsWith(currentInput.toLowerCase().slice(index))
    );

  const matchedPart =
    matchedIndex !== -1
      ? spelling.slice(0, currentInput.length - matchedIndex)
      : "";
  const remainingPart =
    matchedIndex !== -1
      ? spelling.slice(currentInput.length - matchedIndex)
      : spelling;

  return (
    <div
      style={{
        fontSize: "30px",
        position: "absolute",
        left: `${startPos}%`,
        top: falling ? "100%" : "0%",
        transition: `top ${animationDuration} linear`,
      }}
    >
      {matchedPart.length >= 2 ? (
        <span style={{ color: "green" }}>{matchedPart}</span>
      ) : (
        <span>{matchedPart}</span>
      )}
      <span>{remainingPart}</span>
    </div>
  );
}
