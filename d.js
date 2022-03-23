// @ts-nocheck
const shell = require("shelljs");
const program = require("commander");
// const iconv = require("iconv-lite");

const runGit = async function () {
  let currentTime = String(
    new Date().toLocaleString("chinese", { hour12: false })
  );
  let commitStr = `git commit -m "${currentTime}"`;
  shell.exec("git pull", { silent: true });
  shell.echo("git pull完成");
  shell.exec("git add .", { silent: true });
  shell.echo("git add .完成");
  shell.exec(commitStr, { silent: true });
  shell.echo("git commit完成");
  shell.exec("git push");
  shell.echo("git操作完成");
  return true;
};

const runHexo = async function () {
  // shell.exec(
  //   "ipconfig",
  //   { silent: true, encoding: "buffer" },
  //   (err, stdout, stderr) => {
  //     // @ts-ignore
  //     shell.echo(
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
  shell.exec("hexo clean", { silent: true });
  shell.echo("hexo clean完成");
  shell.exec("hexo g", { silent: true });
  shell.echo("hexo g完成");
  if (shell.exec("hexo d").code !== 0) {
    shell.echo("Error: hexo d failed");
    shell.exit(1);
  }
  shell.echo("hexo操作完成");
  return true;
};

const runNewHexo = function (newPageHexoWithTitle) {
  shell.cd("blog");
  shell.exec(newPageHexoWithTitle);
};

const runHexoCI = async function () {
  try {
    program
      .version("0.0.1") //定义版本号
      .option("-g, --gitCI", "gitCI") //参数定义
      .option("-h, --hexoCI", "hexoCI")
      .option("-n, --hexoNewPage", "hexoNewPage")
      .parse(process.argv); //解析命令行参数,参数定义完成后才能调用
    if (program?._optionValues?.gitCI) {
      shell.echo("命中git");
      runGit();
    } else if (program?._optionValues?.hexoCI) {
      shell.echo("命中hexo");
      runHexo();
    } else if (program?._optionValues?.hexoNewPage) {
      shell.echo("命中新建文章页面");
      if (program?.rawArgs[3]) {
        let newPageHexoWithTitle = `hexo n "${program?.rawArgs[3]}"`;
        runNewHexo(newPageHexoWithTitle);
      } else {
        shell.echo("输入最后一个参数，即：文章名称");
      }
    } else {
      await runGit();
      await runHexo();
    }
  } catch (error) {
    shell.echo("CI流程报错!!!!!", error);
  }
};

runHexoCI();
