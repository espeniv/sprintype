interface WordProps {
  spelling: string;
}

export default function Word(props: WordProps) {
  return <p>{props.spelling}</p>;
}
