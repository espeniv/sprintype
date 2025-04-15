import UserInput from "./UserInput";
import WordsContainer from "./WordsContainer";
import { fetchRandomWords } from "../utils/WordFetcher";
import { useState, useEffect } from "react";
import { type WordObject } from "../types";
import "../Styles/GameController.css";
import { supabase } from "../supabaseClient";
import Highscores from "./Highscores";

export default function GameController() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [activeWords, setActiveWords] = useState<WordObject[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(5);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [hasGameStartedOnce, setHasGameStartedOnce] = useState<boolean>(false);

  //Prepare wrds on component mount
  useEffect(() => {
    const fetchWords = async (): Promise<void> => {
      const words = await fetchRandomWords(70);
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
            //Timer is randomly set between 1-3s + .5s per letter
            timer:
              Math.random() * (3000 - 1000) +
              1000 +
              nextWordSpelling.length * 500,
          };
          setActiveWords((prevActiveWords) => [...prevActiveWords, newWord]);
        } else {
          clearInterval(interval!);
        }
      }, 600); //A new word is added every 600ms
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
      setTimer(5);
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

  //Enables restarting by pressing "r" when game is over and has run once
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r" && hasGameStartedOnce && !isGameRunning) {
        handleRestart();
      }
    };

    //Timeout to prevent instant restart while typing when game finishes
    setTimeout(() => document.addEventListener("keydown", handleKeyDown), 1000);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameRunning, hasGameStartedOnce]);

  const handleStart = (): void => {
    setIsGameRunning(true);
    setHasGameStartedOnce(true);
  };

  const handleRestart = async (): Promise<void> => {
    setIsGameRunning(false);
    setActiveWords([]);
    setCurrentInput("");
    setScore(0);

    const words = await fetchRandomWords(70);
    setAllWords(words);

    setIsGameRunning(true);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentInput(e.target?.value);
  };

  // Function to save a high score
  const saveHighscore = async (name: string, score: number) => {
    const { error } = await supabase
      .from("highscores")
      .insert([{ name, score }]);
    if (error) {
      console.error("Error saving high score:", error.message);
    }
  };

  const handleSaveHighscore = () => {
    if (!isGameRunning && hasGameStartedOnce) {
      const playerName = prompt("Enter your name for the high score:");
      if (playerName) {
        saveHighscore(playerName, score);
      }
    }
  };

  return (
    <>
      {hasGameStartedOnce && isGameRunning ? (
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
        {!hasGameStartedOnce ? (
          <p className="start-text">
            Get points by writing as many falling words as possible in 30
            seconds
          </p>
        ) : null}
        <UserInput
          currentInput={currentInput}
          handleInputChange={onInputChange}
        />
        {hasGameStartedOnce && !isGameRunning ? (
          <p className="score-tracker-final">Final score: {score}</p>
        ) : null}
        <div className="button-container">
          <button
            className="app-button"
            style={{
              display: isGameRunning || !hasGameStartedOnce ? "none" : "block",
            }}
            onClick={() => handleSaveHighscore}
            disabled={isGameRunning}
          >
            Save score
          </button>
          <button
            className="app-button"
            style={{
              display: isGameRunning ? "none" : "block",
            }}
            onClick={hasGameStartedOnce ? handleRestart : handleStart}
            disabled={isGameRunning}
          >
            {hasGameStartedOnce ? "Restart" : "Start"}
          </button>
        </div>
        {hasGameStartedOnce && !isGameRunning && (
          <p className="restartText">(Press the "r" key to restart quickly)</p>
        )}
        {!isGameRunning && hasGameStartedOnce && <Highscores />}
      </div>
      {isGameRunning && (
        <WordsContainer activeWords={activeWords} currentInput={currentInput} />
      )}
    </>
  );
}
