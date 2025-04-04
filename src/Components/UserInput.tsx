interface UserInputProps {
  currentInput: string;
  handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void;
}

export default function UserInput(props: UserInputProps) {
  return (
    <input
      onChange={(e) => props.handleInputChange(e)}
      value={props.currentInput}
    />
  );
}
