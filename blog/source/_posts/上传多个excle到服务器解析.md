---
title: 上传多个excle到服务器解析
date: 2020-07-12 17:16:26
tags: [js,hexo]
---

<meta name="referrer" content="no-referrer"/>

## 上传多个Excle文件到服务器解析

一般情况下，一个input框选择对应Excle文件后，会通过action直接传输到后端。

新的需求需要选择多个Excle并在最后点击提交的时候一起将多个Excle文件传输过去，这里需要重新设计一个提交功能

<!-- more -->

> 前端解析Excle、提交多个Excle、

### 前端解析Excle

之前都是后端接受到前端传递的file，直接解析Excle并入库，或者返回数据。现在实现多次传递文件，就需要前端来解析Excle文件

> npm install xlsx  

1.  引入解析库

   ```js
    <input
         ref="excel-upload-input"
         class="excel-upload-input"
         type="file"
         accept=".xlsx, .xls"
         @change="handleClick"
       />
       <el-button
         :disabled="disabledClick"
         :loading="isLoading"
         size="small"
         @click="handleUpload"
         type="primary"
         >导入用户</el-button
       >
           
   import XLSX from 'xlsx'
   
   ```

   

2. 前端代码

   ```js
   export default {
     props: {
       beforeUpload: Function, // eslint-disable-line
       onSuccess: Function, // eslint-disable-line
       isLoading: Boolean,
       disabledClick: Boolean,
     },
     data() {
       return {
         loading: false,
         excelData: {
           header: null,
           results: null,
         },
       }
     },
     methods: {
        generateData({ header, results }) {
         this.excelData.header = header
         this.excelData.results = results
         this.onSuccess && this.onSuccess(this.excelData)
       },
       handleDrop(e) {
         e.stopPropagation()
         e.preventDefault()
         if (this.loading) return
         const files = e.dataTransfer.files
         if (files.length !== 1) {
           this.$message.error('Only support uploading one file!')
           return
         }
         const rawFile = files[0] // only use files[0]
   
         if (!this.isExcel(rawFile)) {
           this.$message.error(
             'Only supports upload .xlsx, .xls, .csv suffix files'
           )
           return false
         }
         this.upload(rawFile)
         e.stopPropagation()
         e.preventDefault()
       },
       handleDragover(e) {
         e.stopPropagation()
         e.preventDefault()
         e.dataTransfer.dropEffect = 'copy'
       },
       handleUpload() {
         this.$refs['excel-upload-input'].click()
       },
       handleClick(e) {
         const files = e.target.files
         const rawFile = files[0] // only use files[0]
         if (!rawFile) return
         this.upload(rawFile)
         this.$emit('getFileData', rawFile)
       },
       upload(rawFile) {
         this.$refs['excel-upload-input'].value = null // fix can't select the same excel
   
         if (!this.beforeUpload) {
           this.readerData(rawFile)
           return
         }
         const before = this.beforeUpload(rawFile)
         if (before) {
           this.readerData(rawFile)
         }
       },
       readerData(rawFile) {
         this.loading = true
         return new Promise((resolve, reject) => {
           const reader = new FileReader()
           reader.onload = (e) => {
             const data = e.target.result
             const workbook = XLSX.read(data, { type: 'array' })
             const firstSheetName = workbook.SheetNames[0]
             const worksheet = workbook.Sheets[firstSheetName]
             const header = this.getHeaderRow(worksheet)
             const results = XLSX.utils.sheet_to_json(worksheet)
             this.generateData({ header, results })
             this.loading = false
             resolve()
           }
           reader.readAsArrayBuffer(rawFile)
         })
       },
       getHeaderRow(sheet) {
         const headers = []
         const range = XLSX.utils.decode_range(sheet['!ref'])
         let C
         const R = range.s.r
         /* start in the first row */
         for (C = range.s.c; C <= range.e.c; ++C) {
           /* walk every column in the range */
           const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
           /* find the cell in the first row */
           let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
           if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
           headers.push(hdr)
         }
         return headers
       },
       isExcel(file) {
         return /\.(xlsx|xls|csv)$/.test(file.name)
       },
       },
      }
   }
   ```

   

3. 将file提交到父组件

   ```js
    this.$emit('getFileData', rawFile)
   ```

#### 提交多个file请求

1. 存储file

   子组件emit提交上去，并临时存储到一个list中。

   ```js
    <upload-excel-component
             :on-success="handleSuccess"
             :before-upload="beforeUpload"
             @getFileData="getFileData"
             :disabledClick="disabledClick"
   />
   <el-button type="primary" :loading="btnLoading" @click="onSubmit">保存</el-button>
   import UploadExcelComponent from '@/components/UploadExcel/index.vue'
   
   
   export default {
     components: { UploadExcelComponent },
     methods: {
       getFileData(e) {
         console.log(e, 'zizujiandeshuju')
         this.fileList.push(e)
         this.currentFile = e
       },
     }
   }
   ```

   

2. 循环提交file

   ```js
   inputFile(form, id) {
         return new Promise((resolve, rej) => {
           let formTem = new FormData() // FormData 对象
           formTem.append('file', form) // 文件对象
           api.importSpecifyUser(formTem, { id: id }).then((res) => {
             if (res.code == 200) {
               resolve(true)
             }
           })
         })
       },
   onSubmit() {
      let form = new FormData() // FormData 对象
      form.append('file', this.fileList[0]) // 文件对象
      this.btnLoading = true
      let id = await this.firstUpload(form, tem)
      let cutFileList =
      this.fileList.length > 1
                   ? this.fileList.slice(1, this.fileList.length)
                   : []
     if (id && cutFileList.length > 0) {
                 cutFileList.forEach(async (e) => {
                   await this.inputFile(e, id)
                 })
     }
   }
   ```

   Tips：1.请求接口里一次只传输一个file，所以采用发送多次请求的形式去传递多个Excle文件

   ​          2. 第一次发送file后，后端会返回给一个id。后续的file请求则类似于更新这个id下的数据，所以，需要采用同步的形式，当第一个请求返回后，再发送后续的file请求。

#### 参考地址

[vue-element-admin](https://panjiachen.github.io/vue-element-admin/#/)