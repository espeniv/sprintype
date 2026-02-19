import { useEffect, useState } from "react";
import { databases, DATABASE_ID, HIGHSCORES_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
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

  //Fetch with Appwrite
  const fetchHighscores = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HIGHSCORES_COLLECTION_ID,
        [
          Query.orderDesc("score"),
          Query.limit(50),
        ]
      );
      return response.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name as string,
        score: doc.score as number,
        created_at: doc.created_at as string,
      }));
    } catch (error) {
      console.error("Error fetching high scores:", error);
      return [];
    }
  };

  return (
    <div className="highscores-container">
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
