//局部模式
const shell = require("shelljs");

const runHexoCI = async function () {
  try {
    await shell.exec("git pull");
    await shell.exec("git add .");
    await shell.exec("git commit -m 'autoCommit'");
    await shell.exec("git push");
    await shell.exec("hexo clean");
    await shell.exec("hexo g");
    await shell.exec("hexo d");
  } catch (error) {
    console.log("CI流程报错!!!!!", error);
  }
};
runHexoCI();
