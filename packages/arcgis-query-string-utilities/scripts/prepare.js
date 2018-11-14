const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

async function asyncExec(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      console.log(stderr);
      console.log(stdout);
      if (error) {
        reject(error);
      } else {
        resolve(error, stdout, stderr);
      }
    });
  });
}

console.log();

(async () => {
  const root = path.resolve(path.join(__dirname, ".."));
  console.log(`root is ${root}`);
  await asyncExec(`tsc --target es6 --module es2015 --declaration`);

  const sourceFile = path.join(root, "QueryStringManager.js");
  const destFile = sourceFile.replace(/\.js$/, ".mjs");
  console.log(`Renaming ${sourceFile} to ${destFile}`);
  await fs.promises.rename(sourceFile, destFile);

  await asyncExec(`tsc --module umd --target es5`);
})().then(() => console.log("completed"), (error) => console.error(error));
