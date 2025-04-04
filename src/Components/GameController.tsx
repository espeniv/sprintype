import UserInput from "./UserInput";
import WordContainer from "./WordContainer";
import { fetchRandomWords } from "../utils/WordFetcher";
import { useState, useEffect } from "react";

export default function GameController() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [activeWords, setActiveWords] = useState<string[]>([]);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [score, setScore] = useState<number>(0);

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

  useEffect(() => {
    const checkInput = (input: string) => {
      activeWords.some((word) => {
        if (word.toLowerCase() === input.toLowerCase()) {
          setScore(score + word.length * 10);
          const newActiveWords = activeWords.filter(
            (word) => word.toLowerCase() !== input.toLowerCase()
          );
          setActiveWords(newActiveWords);
          setCurrentInput("");
        }
      });
    };
    checkInput(currentInput);
  }, [currentInput, activeWords, score]);

  const handleStart = () => {
    setIsGameRunning(true);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target?.value);
  };

  return (
    <div>
      <h1>Game Controller</h1>
      <p>Score: {score}</p>
      <UserInput
        currentInput={currentInput}
        handleInputChange={onInputChange}
      ></UserInput>
      <button onClick={handleStart} disabled={isGameRunning}>
        Start
      </button>
      <WordContainer activeWords={activeWords}></WordContainer>
    </div>
  );
}
