
const packager = require("electron-packager");
const package = require('./package.json');

// https://stackoverflow.com/questions/39063795/electron-app-packaging
packager({
  name: package["name"],
  dir: "./app",
  out: "./dist",
  // ico: "",
  platform: "win32",
  arch: "x64",
  version: "1.7.5",
  overwrite: true,
  asar: true, // パッケージ化
  prune: true,
  icon: "./128x128.ico",
  "app-version": package["version"],
}, (err, text) => {
  if (err) console.log(err);
  console.log("Done: " + text);
});