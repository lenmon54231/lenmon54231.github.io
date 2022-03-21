const shell = require("shelljs");
const program = require("commander");

const runGit = async function () {
  let currentTime = String(
    new Date().toLocaleString("chinese", { hour12: false })
  );
  let commitStr = `git commit -m "${currentTime}"`;
  shell.exec("git pull");
  shell.exec("git add .");
  shell.exec(commitStr);
  shell.exec("git push");
};

const runHexo = async function () {
  shell.exec("hexo clean");
  console.log("hexo执行本地清空缓存");
  await shell.exec("hexo g");
  console.log("hexo执行本地生成文件");
  await shell.exec("hexo d");
  console.log("hexo执行push远端更新");
};

const runHexoCI = async function () {
  try {
    program
      // @ts-ignore
      .version("0.0.1") //定义版本号
      .option("-g, --gitCI", "gitCI") //参数定义
      .option("-h, --hexoCI", "hexoCI")
      .parse(process.argv); //解析命令行参数,参数定义完成后才能调用
    // @ts-ignore
    if (program?._optionValues?.gitCI) {
      console.log("命中git");
      await runGit();
      // @ts-ignore
    } else if (program?._optionValues?.hexoCI) {
      console.log("命中hexo");
      await runHexo();
    } else {
      await runHexo();
      await runGit();
    }
  } catch (error) {
    console.log("CI流程报错!!!!!", error);
  }
};

runHexoCI();
