电子工业出版社“悦读”PDF下载
====================

[悦读](https://yd.51zhy.cn/)  
**项目依赖node环境**  
部署过程:  
* 克隆项目 `git clone https://github.com/shylocks/51zhy_pdf.git`
* 进入项目目录 `cd 51zhy_pdf`
* 安装依赖
```
npm install
# 淘宝源
npm install --registry=https://registry.npm.taobao.org
```
* 运行方式 `node index.js [id] [timeout] [merge]` 
    - id参数为打开书籍详情，浏览器地址栏`id=`后的数字
    - timeout参数默认为10(s)，一直下载失败可尝试调大
    - merge参数默认为1，生成完整的PDF文件，设为0则只下载所有解密后的PDF至`./[id]`
    
遇到大于1000页的PDF可能出现问题，可以分页下载后使用`python merge_pdf.py [id]`合成

代码仅供学习与参考，请合理使用服务器资源。**版权问题概不负责。**
