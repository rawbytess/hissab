import React from "react";
import PromptInputWithBottomActions from "./prompt-input-with-bottom-actions";

export default function Prompt() {
  return (
    <div className="flex h-full flex-col gap-8 items-center justify-end mx-5 mb-10">
      <div className="flex flex-col gap-2 rounded-2xl max-w-[50em] w-full">
        <PromptInputWithBottomActions />
        <div className={"flex flex-row justify-between items-center mx-2"}>
          <p className="text-tiny text-default-400">
            Hissab AI can make mistakes. Consider checking AI response
            expressions.
          </p>
          <p className="text-tiny text-default-400">{prompt.length}/2000</p>
        </div>
      </div>
    </div>
  );
}
