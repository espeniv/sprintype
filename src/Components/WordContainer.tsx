import Word from "./Word";

interface WordContainerProps {
  activeWords: string[];
}

export default function WordContainer(props: WordContainerProps) {
  return (
    <>
      {props.activeWords.map((word, i) => {
        return <Word key={i} spelling={word} />;
      })}
    </>
  );
}
