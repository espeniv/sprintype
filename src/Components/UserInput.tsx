import { useEffect, useRef } from "react";

interface UserInputProps {
  currentInput: string;
  handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void;
}

export default function UserInput(props: UserInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
      ref={inputRef}
      type="text"
      style={{
        opacity: 0,
        position: "absolute",
        pointerEvents: "none",
      }}
      onChange={(e) => props.handleInputChange(e)}
      value={props.currentInput}
    />
  );
}
