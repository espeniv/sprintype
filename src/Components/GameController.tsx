import UserInput from "./UserInput";
import WordContainer from "./WordContainer";
import { fetchRandomWords } from "../utils/WordFetcher";
import { useState, useEffect } from "react";

export default function GameController() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [activeWords, setActiveWords] = useState<string[]>([]);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);

  useEffect(() => {
    const fetchWords = async () => {
      const words = await fetchRandomWords();
      setAllWords(words);
    };
    fetchWords();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isGameRunning) {
      interval = setInterval(() => {
        setActiveWords((prevActiveWords) => {
          if (allWords.length === 0) {
            clearInterval(interval!);
            return prevActiveWords;
          }

          const nextWord = allWords[0];
          setAllWords((prevAllWords) => prevAllWords.slice(1));
          return [...prevActiveWords, nextWord];
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameRunning, allWords]);

  const handleStart = () => {
    setIsGameRunning(true);
  };

  return (
    <div>
      <h1>Game Controller</h1>
      <button onClick={handleStart} disabled={isGameRunning}>
        Start
      </button>
      <UserInput></UserInput>
      <WordContainer activeWords={activeWords}></WordContainer>
    </div>
  );
}
