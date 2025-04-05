interface UserInputProps {
  currentInput: string;
  handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void;
  resetInput(): void;
}

export default function UserInput(props: UserInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      props.resetInput();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.resetInput();
      }}
    >
      <input
        style={{ fontSize: "30px" }}
        onChange={(e) => props.handleInputChange(e)}
        onKeyDown={handleKeyDown}
        value={props.currentInput}
      />
    </form>
  );
}
