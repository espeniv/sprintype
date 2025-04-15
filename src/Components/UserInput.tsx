import { useEffect, useRef } from "react";
import "../Styles/UserInput.css";

interface UserInputProps {
  currentInput: string;
  handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void;
  isGameRunning: boolean;
}

export default function UserInput(props: UserInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  //Focus input on first mount if game is running
  useEffect(() => {
    if (props.isGameRunning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [props.isGameRunning]);

  //Focus input on click anywhere in the application/browserwindow if game is running
  useEffect(() => {
    const handleFocus = () => {
      if (props.isGameRunning && inputRef.current) {
        inputRef.current.focus();
      }
    };
    window.addEventListener("click", handleFocus);
    return () => {
      window.removeEventListener("click", handleFocus);
    };
  }, [props.isGameRunning]);

  return (
    <input
      className="input"
      ref={inputRef}
      type="text"
      onChange={(e) => props.handleInputChange(e)}
      value={props.currentInput}
    />
  );
}
