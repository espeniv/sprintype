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
      const words = await fetchRandomWords(400);
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
            startPos: Math.random() * 90,
            timer: Math.random() * (6000 - 2000) + 2000,
          };
          return [...prevActiveWords, newWord];
        });
      }, 200);
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
      const matchedWord = activeWords.find(
        (word) => word.spelling.toLowerCase() === input.toLowerCase()
      );

      if (matchedWord) {
        setScore(
          (prevScore) => prevScore + 100 + matchedWord.spelling.length * 10
        );
        setActiveWords((prevActiveWords) =>
          prevActiveWords.filter(
            (word) => word.spelling !== matchedWord.spelling
          )
        );
        setCurrentInput("");
      }
    };

    checkInput(currentInput);
  }, [currentInput, activeWords]);

  const handleStart = () => {
    setIsGameRunning(true);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target?.value);
  };

  const resetInput = () => {
    setCurrentInput("");
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontSize: "30px",
        }}
      >
        <p>Score: {score}</p>
        <UserInput
          currentInput={currentInput}
          handleInputChange={onInputChange}
          resetInput={resetInput}
        />
        <button
          style={{ fontSize: "30px" }}
          onClick={handleStart}
          disabled={isGameRunning}
        >
          Start
        </button>
      </div>
      <WordContainer
        activeWords={activeWords}
        currentInput={currentInput}
      ></WordContainer>
    </>
  );
}
