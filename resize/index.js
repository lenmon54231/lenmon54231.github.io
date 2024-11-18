const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 要压缩的图片文件夹路径
const inputDirectory = './input';
// 压缩后的图片存放的文件夹路径
const outputDirectory = './output';

// 确保输出目录存在，如果不存在则创建
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

// 读取输入目录中的所有文件
fs.readdir(inputDirectory, (err, files) => {
  if (err) {
    console.error('Error reading the directory', err);
    return;
  }

  // 遍历所有文件
  files.forEach(file => {
    // 构建完整的文件路径
    const inputPath = path.join(inputDirectory, file);
    const outputPath = path.join(outputDirectory, file);

    // 检查是否为图片文件
    if (sharp.format[inputPath.split('.').pop()]) {
      // 使用sharp压缩图片
      sharp(inputPath)
        .toFormat(inputPath.split('.').pop(), { quality: 80 }) // 可以设置你想要的格式和质量，这里以JPEG格式和80%的质量为例
        .toFile(outputPath)
        .then(() => {
          console.log(`Image ${file} has been compressed and saved to ${outputPath}`);
        })
        .catch(err => {
          console.error(`Error compressing image ${file}`, err);
        });
    } else {
      console.log(`Skipping non-image file ${file}`);
    }
  });
});