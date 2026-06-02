import { writeFileSync } from "fs";

const c = await fetch("https://api.exchangerate.host/symbols");
const currencies = await c.json();
if (!currencies.success) process.exit(1);
const { symbols } = currencies;

const rates = {};

Object.getOwnPropertyNames(symbols).forEach((s) => {
  const x = symbols[s];
  const desc = x["description"];
  rates[s.toLowerCase()] = {
    description: `${desc} currency`,
    type: "currency",
  };
});

writeFileSync("currencies.json", JSON.stringify(rates));
