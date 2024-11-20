const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs");

const fsp = fs.promises;
const outputDirectory = "./output/server-static";

// 配置请求参数
const uploadUrl = "https://www.baidu.com/api/user/upload";
let token = "1";

// 递归读取目录中的所有文件
async function uploadFiles(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fileAbsolutePath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      // 如果是目录，则递归调用processFiles
      await uploadFiles(fileAbsolutePath);
    } else if (entry.isFile()) {
      // 获取完整的相对路径
      const fileRelativePath = path.relative(outputDirectory, fileAbsolutePath);
      console.log("fileRelativePath: ", fileRelativePath);
      // 获取相对路径文件目录
      const fileRelativeDirectoryPath = path.dirname(fileRelativePath);
      const res = await upload({
        fileAbsolutePath,
        fileRelativeDirectoryPath,
        filename: entry.name,
      });
      console.log(fileRelativePath, res.data.code, res.data.msg);
      console.log("-----------------------------");
    }
  }
}

async function upload({
  fileAbsolutePath,
  fileRelativeDirectoryPath,
  filename,
}) {
  // 写入文件和请求参数
  const formData = new FormData();
  let imgFile = fs.createReadStream(fileAbsolutePath);
  formData.append("file", imgFile, filename);
  formData.append("path", fileRelativeDirectoryPath);

  // 配置请求参数
  const config = {
    headers: {
      ...formData.getHeaders(), // 自动从form-data获取正确的Content-Type
      Authorization: "Bearer" + " " + token,
      "X-Requested-With": "XMLHttpRequest",
    },
  };

  // 发起请求
  return axios.post(uploadUrl, formData, config);
}

module.exports = { uploadFiles };
