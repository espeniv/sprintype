interface UserInputProps {
  currentInput: string;
  handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void;
  resetInput(): void;
}

export default function UserInput(props: UserInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.resetInput();
      }}
    >
      <input
        onChange={(e) => props.handleInputChange(e)}
        value={props.currentInput}
      />
    </form>
  );
}
