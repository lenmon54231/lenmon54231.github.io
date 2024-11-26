const uploadModule = require("./upload.js");

const sharp = require("sharp");
const fs = require("fs");

const fsp = fs.promises;

const path = require("path");
// 要压缩的图片文件夹路径
const inputDirectory = "../server-static";
// 压缩后的图片存放的文件夹路径
const outputDirectory = "./output/server-static";

const filterImageList = ["png", "jpg", "jpeg"];

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
        await sharp(res)
          .toFormat(entry.name.split(".").pop(), { quality: 80 }) // 可以设置你想要的格式和质量，这里以JPEG格式和80%的质量为例
          .toFile(outputPath)
          .then(() => {
            // console.log(`Image ${entry.name} has been compressed and saved to ${outputPath}`);
          })
          .catch((err) => {
            console.error(`Error compressing image ${entry.name}`, err);
          });
      } else {
        console.log(`${inputPath}该文件类型无法被压缩，直接复制到对应文件夹下`);
        fs.copyFile(res, outputPath, (err) => {
          if (err) throw err;
        });
      }
    }
  }
}

// 确保目录存在，如果不存在则创建
async function ensureDir(dir) {
  try {
    await fsp.access(dir);
  } catch (err) {
    await fsp.mkdir(dir, { recursive: true });
  }
}

// 删除文件夹（递归删除）
async function deleteFolder(folderPath) {
  try {
    const entries = await fsp.readdir(folderPath, { withFileTypes: true });
    const files = entries.map((entry) => entry.name);

    for (let file of files) {
      const fullPath = path.join(folderPath, file);
      const stats = await fsp.stat(fullPath);

      if (stats.isDirectory()) {
        await deleteFolder(fullPath); // 递归删除子文件夹
      } else {
        await fsp.unlink(fullPath); // 删除文件
      }
    }

    await fsp.rmdir(folderPath);
  } catch (error) {
    console.error("删除文件夹时出错:", error);
  }
}

async function ensureDirAndDelete(dir) {
  try {
    await fsp.access(dir);
    console.log(`删除已存在的文件夹`);
    await deleteFolder(dir);
    console.log(`删除完成`);
  } catch (error) {
    return true;
  }
}

// 开始处理文件
async function startProcessing() {
  try {
    await ensureDirAndDelete(outputDirectory);

    console.log(`开始执行压缩`);
    await ensureDir(outputDirectory);
    await processFiles(inputDirectory);
    console.log(`压缩完成`);

    console.log("开始上传");
    await uploadModule.uploadFiles(outputDirectory);
    console.log("上传结束");
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

startProcessing();
