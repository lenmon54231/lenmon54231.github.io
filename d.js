const shell = require("shelljs");
const program = require("commander");
const iconv = require("iconv-lite");
// const shell = require("child_process");

const runGit = function () {
  let currentTime = String(
    new Date().toLocaleString("chinese", { hour12: false })
  );
  let commitStr = `git commit -m "${currentTime}"`;
  shell.exec("git pull");
  shell.exec("git add .");
  shell.exec(commitStr);
  shell.exec("git push");
  shell.exit(1);
};

const runHexo = function () {
  // shell.exec(
  //   "ipconfig",
  //   { silent: true, encoding: "buffer" },
  //   (err, stdout, stderr) => {
  //     // @ts-ignore
  //     console.log(
  //       "ipconfig ---------------------------",
  //       // @ts-ignore
  //       iconv.decode(stdout, "cp936"),
  //       "ipconfig ---------------------------"
  //     );
  //   }
  // );
  if (!shell.which("hexo")) {
    //在控制台输出内容
    shell.echo("Sorry, this script requires hexo");
    shell.exit(1);
  }
  shell.cd("blog");
  if (shell.exec("hexo clean").code !== 0) {
    shell.echo("Error: hexo failed");
    shell.exit(1);
  }
  if (shell.exec("hexo g").code !== 0) {
    shell.echo("Error: hexo g failed");
    shell.exit(1);
  }
  // if (shell.exec(" hexo s").code !== 0) {
  //   shell.echo("Error: hexo d failed");
  //   shell.exit(1);
  // }
  if (shell.exec(" hexo d").code !== 0) {
    shell.echo("Error: hexo d failed");
    shell.exit(1);
  }
  shell.exit(1);
};

const runHexoCI = function () {
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
      runGit();
      // @ts-ignore
    } else if (program?._optionValues?.hexoCI) {
      console.log("命中hexo");
      runHexo();
    } else {
      runHexo();
      runGit();
    }
  } catch (error) {
    console.log("CI流程报错!!!!!", error);
  }
};

runHexoCI();
