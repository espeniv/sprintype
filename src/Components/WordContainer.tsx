import Word from "./Word";
import { type WordObject } from "../types";

interface WordContainerProps {
  activeWords: WordObject[];
  currentInput: string;
}

export default function WordContainer(props: WordContainerProps) {
  return (
    <div>
      {props.activeWords.map((word) => (
        <Word
          key={word.spelling}
          spelling={word.spelling}
          startPos={word.startPos}
          timer={word.timer}
          currentInput={props.currentInput}
        />
      ))}
    </div>
  );
}
