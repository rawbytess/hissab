import MiniSearch from "minisearch";
import { DateTimeOperands, Operators, Units, Functions } from "engine";
import { CompletionContext } from "@codemirror/autocomplete";

let miniSearch: MiniSearch;

function autoCompleteInit() {
  const autoCompleteDB = [];
  let id = 0;
  for (const unit in Units) {
    autoCompleteDB.push({
      id,
      keyword: unit,
      description: Units[unit].description,
    });
    id++;
  }
  for (const operator in Operators) {
    if (operator.length < 2) continue;
    autoCompleteDB.push({
      id,
      keyword: operator,
      description: Operators[operator].description,
    });
    id++;
  }

  for (const dt in DateTimeOperands) {
    autoCompleteDB.push({
      id,
      keyword: dt,
      description: DateTimeOperands[dt].description,
    });
    id++;
  }
  for (const func in Functions) {
    autoCompleteDB.push({
      id,
      keyword: func,
      description: Functions[func].description,
    });
    id++;
  }
  miniSearch = new MiniSearch({
    fields: ["keyword"],
    storeFields: ["keyword", "description"],
  });
  miniSearch.addAll(autoCompleteDB);
}

autoCompleteInit();

export default function autoComplete(context: CompletionContext) {
  const word = context.matchBefore(/\w*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;
  if (miniSearch === undefined) return null;
  if (word?.text.length < 2) return null;

  const suggetions = miniSearch.search(word.text, { prefix: true });

  const finalSuggetions = suggetions.map((sug) => {
    return {
      label: sug.keyword,
      detail: sug.description,
    };
  });
  return {
    from: word.from,
    options: finalSuggetions,
  };
}
