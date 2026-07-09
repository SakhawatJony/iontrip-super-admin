const fs = require("fs");
const line = fs
  .readFileSync(
    "C:/Users/MNT USER/.cursor/projects/h-iontrip-superadmin/agent-transcripts/cec417b6-322c-48c9-97be-fd0a11181101/cec417b6-322c-48c9-97be-fd0a11181101.jsonl",
    "utf8"
  )
  .split("\n")[174];
const obj = JSON.parse(line);
const text = obj.message.content[0].text;
const start = text.indexOf("import React");
const end =
  text.indexOf("export default ETicketPdfLayout;") +
  "export default ETicketPdfLayout;".length;
let code = text.slice(start, end);
code = code.replace(
  'from "../../../utils/resolveAgentPdfInfo"',
  'from "../../utils/resolveAgentPdfInfo"'
);
code = code.replace(
  'from "../flightbooking/paxTypeUtils"',
  'from "./paxTypeUtils"'
);
fs.writeFileSync(
  "h:/iontrip-superadmin/src/admin/booingInfo/ETicketPdfLayout.jsx",
  code,
  "utf8"
);
console.log("Written", code.split("\n").length, "lines");
