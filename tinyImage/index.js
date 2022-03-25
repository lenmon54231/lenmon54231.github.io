const sharp = require("sharp");
const fs = require("fs");

const path = "./imgOrigin"; //原图路径
const savePath = "./imgZip"; //压缩图保存路径
const quality = 10; //图片质量（0-100）

function creatImage(name, fileName, quality) {
  sharp(name)
    // .resize(300, 200) //缩放
    .jpeg({
      quality: quality,
    })
    .png({ quality: quality })
    .toFile(fileName);
}

// function removeDir(dir) {
//   let files = fs.readdirSync(dir);
//   for (var i = 0; i < files.length; i++) {
//     // let newPath = path.join(dir, files[i]);
//     console.log("dir, files[i]: ", dir, files[i]);
//     // let stat = fs.statSync(newPath);
//     // if (stat.isDirectory()) {
//     //   //如果是文件夹就递归下去
//     //   removeDir(newPath);
//     // } else {
//     //   //删除文件
//     //   fs.unlinkSync(newPath);
//     // }
//   }
//   fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
// }
// removeDir("./imgZip");

function explorer(path) {
  fs.readdir(path, function (err, files) {
    //err 为错误 , files 文件名列表包含文件夹与文件
    if (err) {
      console.log("error:\n" + err);
      return;
    }
    files.forEach(function (file) {
      fs.stat(path + "/" + file, function (err, stat) {
        if (err) {
          console.log(err);
          return;
        }
        if (stat.isDirectory()) {
          explorer(path + "/" + file); // 如果是文件夹就遍历
        } else {
          console.log("文件名:" + savePath + path.substring(11) + "/" + file); // 读出所有的文件
          // return;
          var name = path + "/" + file;
          var dirName = savePath + path.substring(11);
          var fileName = savePath + path.substring(11) + "/" + file;
          fs.exists(dirName, function (exists) {
            console.log("dirName: ", dirName);
            //判断文件夹是否存在
            if (exists) {
            }
            if (!exists) {
              fs.mkdir(dirName, { recursive: true }, async (err) => {
                if (err) {
                  console.log("X 文件夹创建失败");
                } else {
                  creatImage(name, fileName, quality);
                }
              });
            }
          });
        }
      });
    });
  });
}
explorer(path);
