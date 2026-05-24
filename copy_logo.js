const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\SOLUTIONSµ\\.gemini\\antigravity\\brain\\dfa7493d-5591-4567-9e32-7365364fe3ea\\media__1779564387409.jpg";
const dst = "C:\\Users\\SOLUTIONSµ\\.gemini\\antigravity\\scratch\\blick-machinery\\public\\logo.jpg";

try {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log("Logo copied successfully via Node.js!");
  } else {
    console.log("Source file does not exist: " + src);
  }
} catch (e) {
  console.error("Error copying logo: " + e.message);
}
