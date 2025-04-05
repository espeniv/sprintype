import Word from "./Word";
import { type WordObject } from "../types";

interface WordContainerProps {
  activeWords: WordObject[];
}

export default function WordContainer(props: WordContainerProps) {
  return (
    <>
      {props.activeWords.map((word, i) => (
        <Word
          key={i}
          spelling={word.spelling}
          startPos={word.startPos}
          endPos={word.endPos}
          timer={word.timer}
        />
      ))}
    </>
  );
}
