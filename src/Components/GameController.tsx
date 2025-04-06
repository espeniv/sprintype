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
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);

  //Prepare wrds on component mount
  useEffect(() => {
    const fetchWords = async (): Promise<void> => {
      const words = await fetchRandomWords(300);
      setAllWords(words);
    };
    fetchWords();
  }, []);

  //Handles word spawning
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isGameRunning) {
      interval = setInterval(() => {
        setActiveWords((prevActiveWords) => {
          //Stop when there is no more available words
          if (allWords.length === 0) {
            clearInterval(interval!);
            return prevActiveWords;
          }

          const nextWordSpelling = allWords[0];
          setAllWords((prevAllWords) => prevAllWords.slice(1));

          //Randomize start position and travel time
          const newWord: WordObject = {
            spelling: nextWordSpelling,
            startPos: Math.random() * 90,
            timer: Math.random() * (6000 - 2500) + 2500,
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

    const words = await fetchRandomWords(400);
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
        <p className="score-tracker">Score: {score}</p>
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
      <WordsContainer
        activeWords={activeWords}
        currentInput={currentInput}
      ></WordsContainer>
    </>
  );
}
