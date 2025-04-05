import Word from "./Word";
import { type WordObject } from "../types";

interface WordContainerProps {
  activeWords: WordObject[];
}

export default function WordContainer(props: WordContainerProps) {
  return (
    <>
      {props.activeWords.map((word) => (
        <Word
          key={word.spelling}
          spelling={word.spelling}
          startPos={word.startPos}
          timer={word.timer}
        />
      ))}
    </>
  );
}
