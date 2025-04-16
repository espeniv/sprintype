import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../Styles/Highscores.css";

interface Highscore {
  id: string;
  name: string;
  score: number;
  created_at: string;
}

interface HighScoresProps {
  hasSavedScore: boolean;
}

export default function HighScores({ hasSavedScore }: HighScoresProps) {
  const [highscores, setHighscores] = useState<Highscore[]>([]);

  //Load highscores on component muont
  useEffect(() => {
    const loadHighscores = async () => {
      const scores = await fetchHighscores();
      setHighscores(scores);
    };
    //Ensure new score is submitted before updating component
    setTimeout(() => loadHighscores(), 100);
  }, [hasSavedScore]);

  //Fetch with supabase
  const fetchHighscores = async () => {
    const { data, error } = await supabase
      .from("highscores")
      .select("*")
      .order("score", { ascending: false })
      .limit(50);
    if (error) {
      console.error("Error fetching high scores:", error.message);
      return [];
    }
    return data;
  };

  return (
    <div className="highscores-container">
      <h2>High Scores</h2>
      <ol className="highscores-list">
        {highscores.map((score, index) => (
          <li key={score.id}>
            <span className="user-name">{`${index + 1}. ${score.name}`}</span>
            <span className="score">{score.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
