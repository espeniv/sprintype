import UserInput from "./UserInput";
import WordsContainer from "./WordsContainer";
import { fetchRandomWords } from "../utils/WordFetcher";
import { useState, useEffect } from "react";
import { type WordObject } from "../types";
import "../Styles/GameController.css";

export default function GameController() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [activeWords, setActiveWords] = useState<WordObject[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);

  //Prepare wrds on component mount
  useEffect(() => {
    const fetchWords = async (): Promise<void> => {
      const words = await fetchRandomWords(35);
      setAllWords(words);
    };
    fetchWords();
  }, []);

  //Handles word spawning
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isGameRunning) {
      interval = setInterval(() => {
        if (allWords.length > 0) {
          const nextWordSpelling = allWords[0];
          setAllWords((prevAllWords) => prevAllWords.slice(1));
          const newWord: WordObject = {
            spelling: nextWordSpelling,
            startPos: Math.random() * 90,
            timer: Math.random() * (6000 - 2500) + 2500,
          };
          setActiveWords((prevActiveWords) => [...prevActiveWords, newWord]);
        } else {
          clearInterval(interval!);
        }
      }, 850); //A new word is added every second
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameRunning, allWords]);

  //Handles timer for the game, decrementing in an interval of 1s
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isGameRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval!);
            setIsGameRunning(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      setTimer(30);
    }
    return () => clearInterval(interval!);
  }, [isGameRunning]);

  //Decrement the timer for each word every 100ms, and remove accordingly
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

  //Main logic that checks if the input matches with an active word
  useEffect(() => {
    const checkInput = (input: string) => {
      const matchedWord = activeWords.find((word) =>
        input.toLowerCase().includes(word.spelling.toLowerCase())
      );

      if (matchedWord) {
        //Score calculation
        setScore(
          (prevScore) => prevScore + 100 + matchedWord.spelling.length * 10
        );

        //Delay is added with setTimeout to allow for fade out animation on words when they are typed correctly
        setTimeout(() => {
          setActiveWords((prevActiveWords) =>
            prevActiveWords.filter(
              (word) => word.spelling !== matchedWord.spelling
            )
          );
        }, 300);
        setCurrentInput("");
      }
    };

    checkInput(currentInput);
  }, [currentInput, activeWords]);

  //Check if game is finished
  useEffect(() => {
    if (allWords.length === 0 && activeWords.length === 0) {
      setIsGameRunning(false);
    }
  }, [allWords, activeWords]);

  const handleStart = (): void => {
    setIsGameRunning(true);
    setHasGameStarted(true);
  };

  const handleRestart = async (): Promise<void> => {
    setIsGameRunning(false);
    setActiveWords([]);
    setCurrentInput("");
    setScore(0);
    setHasGameStarted(false);

    const words = await fetchRandomWords(30);
    setAllWords(words);

    setIsGameRunning(true);
    setHasGameStarted(true);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentInput(e.target?.value);
  };

  return (
    <>
      {hasGameStarted && isGameRunning ? (
        <>
          <div className="score-tracker">
            <p>Score: {score}</p>
            <p>Timer: {timer}</p>
          </div>
        </>
      ) : null}
      <div className="game-container">
        <h1
          style={{
            display: isGameRunning ? "none" : "block",
          }}
          className="app-title"
        >
          Sprintype
        </h1>
        <UserInput
          currentInput={currentInput}
          handleInputChange={onInputChange}
        />
        {hasGameStarted && !isGameRunning ? (
          <p className="score-tracker-final">Final score: {score}</p>
        ) : null}
        <button
          className="start-button"
          style={{
            display: isGameRunning ? "none" : "block",
          }}
          onClick={hasGameStarted ? handleRestart : handleStart}
          disabled={isGameRunning}
        >
          {hasGameStarted ? "Restart" : "Start"}
        </button>
      </div>
      {isGameRunning && (
        <WordsContainer activeWords={activeWords} currentInput={currentInput} />
      )}
    </>
  );
}
