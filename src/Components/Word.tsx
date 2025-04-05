interface WordProps {
  spelling: string;
  startPos: number;
  endPos: number;
  timer: number;
}

export default function Word(props: WordProps) {
  const animationDuration = `${props.timer / 1000}s`;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: `${props.startPos}%`,
          transition: `left ${animationDuration} linear`,
          transform: `translateX(${props.endPos - props.startPos}%)`,
        }}
      >
        {props.spelling}
      </div>
    </>
  );
}
