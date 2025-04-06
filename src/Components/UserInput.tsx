import { useEffect, useRef } from "react";
import "../Styles/UserInput.css";

interface UserInputProps {
  currentInput: string;
  handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void;
}

export default function UserInput(props: UserInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  //Focus input on first mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  //Focus input on click anywhere in the application/browserwindow
  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    window.addEventListener("click", handleFocus);
    return () => {
      window.removeEventListener("click", handleFocus);
    };
  }, []);

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
