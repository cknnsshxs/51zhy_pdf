电子工业出版社“悦读”PDF下载
====================

[悦读](https://yd.51zhy.cn/)  

windows用户可跳过部署过程，直接下载[编译好的exe](https://www.lanzous.com/i93c4dg)。由于无法打包hummus库，使用`dev.exe [id] [timeout]`下载完成后，再调用`merge_pdf [id]`合成   
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
* 合并PDF需要调用hummus库，在node v10.18.1(Centos) 与 node v12.9.1(Windows)下安装成功，在node v13.2.0(Mac)下安装失败，在无法安装hummus的情况下，推荐使用python合并PDF。  

运行方式： `node index.js [id] [timeout] [merge]` / `dev.exe [id] [timeout]` 
* id参数为打开书籍详情，浏览器地址栏`id=`后的数字
* timeout参数默认为10(s)，一直下载失败可尝试调大
* merge参数默认为1，生成完整的PDF文件，设为0则只下载所有解密后的PDF至`./[id]`
    
遇到大于1000页的PDF可能出现问题，可以分页下载后使用`python merge_pdf.py [id]`合成

代码仅供学习与参考，请合理使用服务器资源。**版权问题概不负责。**
