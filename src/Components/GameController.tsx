import UserInput from "./UserInput";
import WordContainer from "./WordContainer";
import { fetchRandomWords } from "../utils/WordFetcher";
import { useState, useEffect } from "react";
import { type WordObject } from "../types";

export default function GameController() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [activeWords, setActiveWords] = useState<WordObject[]>([]);
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

          const nextWordSpelling = allWords[0];
          setAllWords((prevAllWords) => prevAllWords.slice(1));
          const newWord: WordObject = {
            spelling: nextWordSpelling,
            startPos: Math.random() * 100,
            endPos: Math.random() * 100,
            timer: 3000,
          };
          return [...prevActiveWords, newWord];
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
    const timerInterval = setInterval(() => {
      setActiveWords((prevActiveWords) =>
        prevActiveWords
          .map((word) => ({ ...word, timer: word.timer - 100 }))
          .filter((word) => word.timer > 0)
      );
    }, 100);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    const checkInput = (input: string) => {
      activeWords.some((word) => {
        if (word.spelling.toLowerCase() === input.toLowerCase()) {
          setScore(score + word.spelling.length * 10);
          const newActiveWords = activeWords.filter(
            (word) => word.spelling.toLowerCase() !== input.toLowerCase()
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
