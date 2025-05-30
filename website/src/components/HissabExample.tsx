import React, { useState, useEffect } from "react";
import { doLex, doParse } from "engine"; // Assuming 'engine' exports these
import type { TokenType } from "engine"; // Assuming 'engine' exports this type

// Define the structure of the result from doParse (replace 'any' if you know the specific type)
interface ParseResult {
  result: string | number | any; // Adjust 'any' based on what doParse actually returns
  // Add other potential properties from the result object if needed
}

// Define the structure for each processed line stored in state
interface ProcessedLine {
  text: string;
  tokens: TokenType[];
  res: ParseResult;
  htmlSpan: string;
}

// Define the props for the React component
interface HissabExampleProps {
  text: string;
  className?: string; // Optional classes string
}

// Define the highlight styles (same as in Astro)
const hissabTags: Record<string, string> = {
  numberToken: "00ff71",
  unitToken: "e7d81a",
  dateToken: "e1f05d",
  functionToken: "32c5ff",
  operatorToken: "e88b00",
  controllerToken: "a3a2f6",
  variableToken: "f984e1",
  colorToken: "84f9ef",
  VariableNameToken: "f984e1", // Note: You had VariableNameToken and variableToken, ensure this is intended
  undefinedToken: "999999",
  stringToken: "999999",
  comment: "93A1A1",
};

// Helper function to generate highlighted HTML (can be outside the component)
function generateHighlightedHTML(
  originalString: string,
  tokens: TokenType[],
): string {
  let resultHTML = "";
  let currentIndex = 0;

  tokens.forEach((token) => {
    // Find the token's position starting from the current index
    const tokenStart = originalString.indexOf(
      token.originalValue,
      currentIndex,
    );

    if (tokenStart === -1) {
      // Handle cases where the token might not be found sequentially (e.g., overlapping tokens or complex scenarios)
      // This might indicate an issue with lexing or the original string vs tokens.
      // For now, we'll skip ahead, but you might need more robust handling.
      console.warn(
        `Token '${token.originalValue}' not found starting from index ${currentIndex} in string '${originalString}'`,
      );
      // Try searching from the beginning as a fallback? Or just skip?
      // Let's just advance the index past the expected length to avoid infinite loops if indexOf keeps failing.
      currentIndex += token.originalValue.length;
      return; // Skip this token in the output if not found sequentially
    }

    // Add the text between the previous token and the current one
    if (tokenStart > currentIndex) {
      const gap = originalString.slice(currentIndex, tokenStart);
      // Escape HTML entities in the gap text to prevent XSS if the original string could contain HTML
      // For simplicity here, assuming plain text. Use a library or manual escaping if needed.
      resultHTML += gap;
    }

    // Determine the style based on the token's instance name
    // Using 'as keyof typeof hissabTags' asserts that token.instanceName is a valid key
    const styleKey = token.instanceName as keyof typeof hissabTags;
    const styleColor = hissabTags[styleKey];

    if (styleColor) {
      const colorStyle = `color: #${styleColor};`;
      // Escape token.originalValue if it could contain HTML characters
      resultHTML += `<span style="${colorStyle}">${token.originalValue}</span>`;
    } else {
      // If no style is defined, just wrap in a plain span (or don't wrap, depending on desired output)
      // Escape token.originalValue if it could contain HTML characters
      resultHTML += `<span>${token.originalValue}</span>`;
    }

    // Update current index to be after the current token
    currentIndex = tokenStart + token.originalValue.length;
  });

  // Add any remaining text after the last token
  if (currentIndex < originalString.length) {
    // Escape potentially harmful characters in the remaining text
    resultHTML += originalString.slice(currentIndex);
  }

  return resultHTML;
}

// The React Functional Component
const HissabExample: React.FC<HissabExampleProps> = ({
  text,
  className = "",
}) => {
  // State to store the processed lines
  const [processedLines, setProcessedLines] = useState<ProcessedLine[]>([]);
  const [error, setError] = useState<string | null>(null); // Optional: state for handling errors

  useEffect(() => {
    // Define an async function inside useEffect to perform the processing
    const processTextLines = async () => {
      // Reset state for new text
      setProcessedLines([]);
      setError(null);

      if (!text) {
        return; // Exit early if text is empty or null/undefined
      }

      const lines = text.split("\n");
      const results: ProcessedLine[] = [];

      try {
        // Process each line
        // Using Promise.all to run parsing potentially in parallel (if doParse allows/benefits)
        // If order matters strictly or doParse has side effects, use a sequential loop (for...of)
        const linePromises = lines.map(async (lineText) => {
          if (!lineText.trim()) {
            // Handle empty lines if needed, perhaps return a specific object or null
            // For now, we create a simple representation for empty lines
            return {
              text: lineText,
              tokens: [],
              res: { result: "" },
              htmlSpan: "",
            };
          }
          try {
            const tokens = doLex(lineText);
            const htmlSpan = generateHighlightedHTML(lineText, tokens);
            const res = await doParse(tokens, true); // Await the async parse result
            return { text: lineText, tokens, res, htmlSpan };
          } catch (e) {
            console.error(`Error processing line: "${lineText}"`, e);
            // Return an object indicating the error for this line, or null/undefined
            return {
              text: lineText,
              tokens: [],
              res: { result: "Error processing line" },
              htmlSpan: `<span style="color: red;">${lineText}</span>`,
            };
          }
        });

        // Wait for all lines to be processed
        const processedResults = await Promise.all(linePromises);

        // Filter out any null/undefined results if you chose to return those on error/skip
        setProcessedLines(processedResults.filter(Boolean) as ProcessedLine[]);
      } catch (e) {
        // Catch potential errors from Promise.all or surrounding logic
        console.error("Error processing text lines:", e);
        setError("Failed to process input text.");
      }
    };

    processTextLines();

    // The effect depends on the 'text' prop. It reruns whenever 'text' changes.
  }, [text]);

  // Optional: Display a loading state or error message
  if (error) {
    return (
      <div
        className={`hissab-example bg-red-100 text-red-700 p-4 ${className}`}
      >
        Error: {error}
      </div>
    );
  }

  // Render the component
  return (
    <div className={`hissab-example bg-amber-50 ${className}`}>
      {processedLines.map((line, index) => (
        <div className="eg-lines" key={index}>
          {" "}
          {/* Use index as key, consider a more stable key if possible */}
          {/* Use dangerouslySetInnerHTML to render the HTML string */}
          <div dangerouslySetInnerHTML={{ __html: line.htmlSpan }} />
          {/* Apply inline styles using the style object syntax */}
          <span style={{ color: "#9385ff", textAlign: "right" }}>
            {/* Access the result property */}
            {line.res?.result ?? ""}{" "}
            {/* Use optional chaining and nullish coalescing for safety */}
          </span>
        </div>
      ))}
    </div>
  );
};

export default HissabExample;
