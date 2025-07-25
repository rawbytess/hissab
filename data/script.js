import fs from "fs";
import { prompts_with_exp } from "./prompts_small_with_exp";

// Get all unique headers from all objects
const headers = Array.from(
  new Set(prompts_with_exp.flatMap((obj) => Object.keys(obj))),
);

// Convert to CSV
const csvRows = [
  headers.join(","), // header row
  ...prompts_with_exp.map((row) =>
    headers
      .map((header) => {
        let value = row[header] ?? "";
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      })
      .join(","),
  ),
];

const csvContent = csvRows.join("\n");

// Write to file
fs.writeFileSync("prompts_small_with_exp.csv", csvContent, "utf8");
console.log("CSV file created successfully");
