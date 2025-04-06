import Word from "./Word";
import { type WordObject } from "../types";

interface WordsContainerProps {
  activeWords: WordObject[];
  currentInput: string;
}

export default function WordsContainer({
  activeWords,
  currentInput,
}: WordsContainerProps) {
  return (
    <div>
      {activeWords.map((word) => (
        <Word
          key={word.spelling}
          spelling={word.spelling}
          startPos={word.startPos}
          timer={word.timer}
          currentInput={currentInput}
        />
      ))}
    </div>
  );
}
