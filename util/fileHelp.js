const fs = require("fs");

function handleFile(filePath) {
  return fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Delete a file at ${filePath}`);
    }
  });
}

exports.handleFile = handleFile;
