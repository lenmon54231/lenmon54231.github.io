const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// 要压缩的图片文件夹路径
const inputDirectory = './input';
// 压缩后的图片存放的文件夹路径
const outputDirectory = './output';

const filterImageList = ['png','jpg','jpeg']

// 递归读取目录中的所有文件
async function processFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (let entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      // 如果是目录，则递归调用processFiles
      await processFiles(res);
    } else if (entry.isFile() && filterImageList.includes(entry.name.split('.').pop())) {
      // 如果是文件且是图片格式，则进行压缩
      const outputPath = path.join(outputDirectory, path.relative(inputDirectory, res));
      const outputDir = path.dirname(outputPath);

      // 确保输出目录存在，如果不存在则创建
      await ensureDir(outputDir);

      await sharp(res)
         .toFormat(entry.name.split('.').pop(), { quality: 80 }) // 可以设置你想要的格式和质量，这里以JPEG格式和80%的质量为例
        .toFile(outputPath)
        .then(() => {
          console.log(`Image ${entry.name} has been compressed and saved to ${outputPath}`);
        })
        .catch(err => {
          console.error(`Error compressing image ${entry.name}`, err);
        });
    }
  }
}

// 确保目录存在，如果不存在则创建
async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch (err) {
    await fs.mkdir(dir, { recursive: true });
  }
}

// 开始处理文件
async function startProcessing() {
  try {
    await ensureDir(outputDirectory);
    await processFiles(inputDirectory);
  } catch (err) {
    console.error('An error occurred:', err);
  }
}

startProcessing();