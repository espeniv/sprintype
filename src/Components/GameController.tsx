import UserInput from "./UserInput";
import WordsContainer from "./WordsContainer";
import { fetchRandomWords } from "../utils/WordFetcher";
import { useState, useEffect, useRef } from "react";
import { type WordObject } from "../types";
import "../Styles/GameController.css";
import { supabase } from "../supabaseClient";
import Highscores from "./Highscores";
import popSoundFile from "../../public/assets/pop.mp3";

export default function GameController() {
  const [allWords, setAllWords] = useState<string[]>([]);
  const [activeWords, setActiveWords] = useState<WordObject[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [hasGameStartedOnce, setHasGameStartedOnce] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [hasSavedScore, setHasSavedScore] = useState<boolean>(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const soundBuffer = useRef<AudioBuffer | null>(null);

  //Prepare wrds on component mount
  useEffect(() => {
    const fetchWords = async (): Promise<void> => {
      const words = await fetchRandomWords(70);
      setAllWords(words);
    };
    fetchWords();
  }, []);

  //Sound setup
  useEffect(() => {
    const loadSound = async () => {
      if (!audioContext.current) {
        audioContext.current = new AudioContext();
      }
      const response = await fetch(popSoundFile);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await audioContext.current.decodeAudioData(arrayBuffer);
      soundBuffer.current = buffer;
    };
    loadSound();
  }, []);

  //Function to play sound
  const playSound = () => {
    if (audioContext.current && soundBuffer.current) {
      const source = audioContext.current.createBufferSource();
      source.buffer = soundBuffer.current;
      source.connect(audioContext.current.destination);
      source.start(0);
    }
  };

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

      if (matchedWord && isGameRunning) {
        //Play sound on correct word
        playSound();
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

  /* Disabled for now
  //Focus name input when the game ends
  useEffect(() => {
    //Only focus after 1s as we dont want to mix game input with name input
    setTimeout(() => {
      if (!isGameRunning && hasGameStartedOnce && !hasSavedScore) {
        nameInputRef.current?.focus();
      }
    }, 500);
  }, [isGameRunning, hasGameStartedOnce, hasSavedScore]);
  */

  //Enables restarting by holding "r" when game is over and has run once
  useEffect(() => {
    let holdTimer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r" && hasGameStartedOnce && !isGameRunning) {
        if (!holdTimer) {
          holdTimer = setTimeout(() => {
            handleRestart(); //Restart the game after .5s of holding
          }, 500);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") {
        //Cleartimer if key is released before .5s has passed
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (holdTimer) {
        clearTimeout(holdTimer);
      }
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
    setHasSavedScore(false);
    setPlayerName("");

    const words = await fetchRandomWords(70);
    setAllWords(words);

    setIsGameRunning(true);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentInput(e.target?.value);
  };

  // Function to save a score using supabase
  const saveHighscore = async (name: string, score: number) => {
    const { error } = await supabase
      .from("highscores")
      .insert([{ name, score }]);
    if (error) {
      console.error("Error saving high score:", error.message);
    }
  };

  const handleSaveHighscore = () => {
    if (playerName.trim() === "") {
      alert("Enter a name to save highscore");
      return;
    }
    saveHighscore(playerName, score);
    setHasSavedScore(true);
    setPlayerName("");
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
          <>
            <p className="start-text">
              Get points by writing as many falling words as possible in 30
              seconds
            </p>
            <p className="desktop-text">Game is only playable on desktop</p>
          </>
        ) : null}
        <UserInput
          currentInput={currentInput}
          handleInputChange={onInputChange}
          isGameRunning={isGameRunning}
        />
        {!isGameRunning && hasGameStartedOnce && (
          <Highscores hasSavedScore={hasSavedScore} />
        )}
        {hasGameStartedOnce && !isGameRunning ? (
          <div className="score-and-input-container">
            <p
              className={`score-tracker-final ${
                hasSavedScore ? "score-tracker-final-submitted" : ""
              }`}
            >
              {!hasSavedScore ? (
                <>
                  Your final score:{" "}
                  <span className="score-highlight">{score}</span>
                </>
              ) : (
                "Score submitted"
              )}
            </p>
            <input
              type="text"
              className="player-name-input"
              placeholder={!hasSavedScore ? "Enter your name" : "-"}
              disabled={hasSavedScore || score === 0}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              ref={nameInputRef}
            />
          </div>
        ) : null}
        <div className={hasGameStartedOnce ? "button-container" : "null"}>
          <button
            className="app-button"
            style={{
              display: isGameRunning || !hasGameStartedOnce ? "none" : "block",
            }}
            onClick={handleSaveHighscore}
            disabled={
              isGameRunning ||
              hasSavedScore ||
              playerName.trim() === "" ||
              score === 0
            }
          >
            Submit score
          </button>
          <button
            className={`app-button ${
              !hasGameStartedOnce ? "start-button" : "null"
            }`}
            style={{
              display: isGameRunning ? "none" : "",
            }}
            onClick={hasGameStartedOnce ? handleRestart : handleStart}
            disabled={isGameRunning}
          >
            {hasGameStartedOnce ? "Restart" : "Start"}
          </button>
        </div>
        {hasGameStartedOnce && !isGameRunning && (
          <p className="restart-text">(Hold the "r" key to restart quickly)</p>
        )}
      </div>
      {isGameRunning && (
        <WordsContainer activeWords={activeWords} currentInput={currentInput} />
      )}
    </>
  );
}
