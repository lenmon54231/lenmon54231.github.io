const shell = require("shelljs");
const program = require("commander");
const iconv = require("iconv-lite");
const inquirer = require("inquirer");

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
  // if (shell.exec("hexo s").code !== 0) {
  //   shell.echo("Error: hexo d failed");
  //   shell.exit(1);
  // }
  if (shell.exec("hexo d").code !== 0) {
    shell.echo("Error: hexo d failed");
    shell.exit(1);
  }
};

const runNewHexo = function () {
  inquirer
    .prompt([
      /* Pass your questions in here */
      "write your page title",
    ])
    .then((answers) => {
      console.log("answers: ", answers);
      let title = `hexo n "${answers}" `;
      shell.exec(title);
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else when wrong
      }
    });
};

const runHexoCI = function () {
  try {
    program
      // @ts-ignore
      .version("0.0.1") //定义版本号
      .option("-g, --gitCI", "gitCI") //参数定义
      .option("-h, --hexoCI", "hexoCI")
      .option("-n, --hexoNewPage", "hexoNewPage")
      .parse(process.argv); //解析命令行参数,参数定义完成后才能调用
    // @ts-ignore
    if (program?._optionValues?.gitCI) {
      console.log("命中git");
      runGit();
      shell.exit(1);
      // @ts-ignore
    } else if (program?._optionValues?.hexoCI) {
      console.log("命中hexo");
      runHexo();
      shell.exit(1);
      // @ts-ignore
    } else if (program?._optionValues?.hexoNewPage) {
      console.log("命中新建文章页面");
      runNewHexo();
    } else {
      runGit();
      runHexo();
      shell.exit(1);
    }
  } catch (error) {
    console.log("CI流程报错!!!!!", error);
  }
};

runHexoCI();
