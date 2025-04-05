export const fetchRandomWords = async (amount: number): Promise<string[]> => {
  const response = await fetch("/assets/wordfile.txt");
  console.log("Response status:", response.status, "URL:", response.url);

  if (!response.ok) {
    throw new Error("Failed to fetch the word file.");
  }

  const fileContent = await response.text();
  const words = fileContent.split(" ").filter(Boolean);

  const shuffledWords = words.sort(() => 0.5 - Math.random());
  const uppercasedWords = shuffledWords.map(
    (word) => word[0].toUpperCase() + word.slice(1)
  );
  return uppercasedWords.slice(0, amount);
};
