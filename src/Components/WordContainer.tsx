import { useState } from "react";
import Word from "./Word";

export default function WordContainer() {
  const [allWords, setAllWords] = useState([
    "Apple",
    "Orange",
    "Banana",
    "Pineapple",
    "Mango",
  ]);
  const [activeWords, setActiveWords] = useState(["Apple", "Orange", "Banana"]);

  return (
    <>
      {activeWords.map((word, i) => {
        return <Word key={i} spelling={word} />;
      })}
    </>
  );
}
