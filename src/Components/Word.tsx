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

  const [falling, setFalling] = useState<boolean>(false);

  //Start animation on component/word load
  useEffect(() => {
    const timeout = setTimeout(() => setFalling(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  //Color the part of the word that matches with the current input
  const matchedIndex: number = currentInput
    .toLowerCase()
    .split("")
    .findIndex((_, index) =>
      spelling.toLowerCase().startsWith(currentInput.toLowerCase().slice(index))
    );

  const matchedPart: string =
    matchedIndex !== -1
      ? spelling.slice(0, currentInput.length - matchedIndex)
      : "";

  const remainingPart: string =
    matchedIndex !== -1
      ? spelling.slice(currentInput.length - matchedIndex)
      : spelling;

  //Inline styling for this component to handle animation and coloring
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
      {/* Currently set to only color parts if 2 or more letters match */}
      {matchedPart.length >= 2 ? (
        <span style={{ color: "green" }}>{matchedPart}</span>
      ) : (
        <span>{matchedPart}</span>
      )}
      <span>{remainingPart}</span>
    </div>
  );
}
