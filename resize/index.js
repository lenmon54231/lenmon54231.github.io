const shell = require("shelljs");
const fs = require("fs");

const fsp = fs.promises;

const path = require("path");

const filterImageList = ["png", "jpg", "jpeg"];
const inputDirectory = "./input";

// 递归读取目录中的所有文件
async function processFiles(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
  
    for (let entry of entries) {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        // 如果是目录，则递归调用processFiles
        await processFiles(res);
      } else if (entry.isFile()) {
        const inputPath = path.join(
          inputDirectory,
          path.relative(inputDirectory, res)
        );
  
        // 如果是文件且是图片格式，则进行压缩
        const outputPath = path.join(
          outputDirectory,
          path.relative(inputDirectory, res)
        );
        const outputDir = path.dirname(outputPath);
  
        // 确保输出目录存在，如果不存在则创建
        await ensureDir(outputDir);
  
        if (filterImageList.includes(entry.name.split(".").pop())) {
          console.log('执行ff')
        } else {
          console.log(`${inputPath}该文件类型无法被转化`);
        }
      }
    }
  }

  processFiles()