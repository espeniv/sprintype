import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface Highscore {
  id: string;
  name: string;
  score: number;
  created_at: string;
}

export default function HighScores() {
  const [highscores, setHighscores] = useState<Highscore[]>([]);

  //Load highscores on component muont
  useEffect(() => {
    const loadHighscores = async () => {
      const scores = await fetchHighscores();
      setHighscores(scores);
    };
    loadHighscores();
  }, []);

  //Fetch with supabase
  const fetchHighscores = async () => {
    const { data, error } = await supabase
      .from("highscores")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);
    if (error) {
      console.error("Error fetching high scores:", error.message);
      return [];
    }
    return data;
  };

  return (
    <div className="high-scores">
      <h2>High Scores</h2>
      <ol>
        {highscores.map((score) => (
          <li key={score.id}>
            {score.name}: {score.score}
          </li>
        ))}
      </ol>
    </div>
  );
}
