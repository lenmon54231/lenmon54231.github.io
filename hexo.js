//局部模式
const shell = require("shelljs");
//引用commander模块，这里返回的是一个commander对象
let program = require("commander");

const runGit = async function () {
  await shell.exec("git pull", { async: true });
  await shell.exec("git add .", { async: true });
  await shell.exec("git commit -m 'autoCommit'", { async: true });
  await shell.exec("git push", { async: true });
};

const runHexo = async function () {
  await shell.exec("git pull", { async: true });
  await shell.exec("git add .", { async: true });
  await shell.exec("git commit -m 'autoCommit'", { async: true });
  await shell.exec("git push", { async: true });
};
const runHexoCI = async function () {
  try {
    program
      .version("0.0.1") //定义版本号
      .option("-g, --gitCI", "gitCI") //参数定义
      .option("-h, --hexoCI", "hexoCI")
      .parse(process.argv); //解析命令行参数,参数定义完成后才能调用
    if (program?._optionValues?.gitCI) {
      console.log("命中git");
      await runGit();
    } else if (program?._optionValues?.hexoCI) {
      console.log("命中hexo");
      await runHexo();
    } else {
      await runGit();
      await runHexo();
    }
  } catch (error) {
    console.log("CI流程报错!!!!!", error);
  }
};

runHexoCI();
