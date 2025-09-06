# Draw Pic 项目结构说明

## 项目概述
这是一个React项目，使用webpack多入口配置同时启动两个不同分辨率和背景色的网页：
- 主网页：3840x2160分辨率，红色背景，访问地址：http://localhost:3000/main.html
- 副网页：1920x1080分辨率，蓝色背景，访问地址：http://localhost:3000/secondary.html

## 技术实现
采用test目录中的双网页实现方法：
1. **Webpack多入口配置**：同时构建主应用和副应用
2. **SharedWorker通信**：实现两个页面间的实时数据同步
3. **单服务器多页面**：使用一个webpack dev server同时服务两个HTML页面

## 文件结构
```
draw-pic/
├── src/                        # 源代码目录
│   ├── apps/                   # 应用代码目录
│   │   ├── main-app/          # 主应用 (3840x2160, 红色)
│   │   │   ├── App.js         # 主应用组件（含SharedWorker通信）
│   │   │   ├── App.css        # 主应用样式
│   │   │   └── index.js       # 主应用入口
│   │   └── secondary-app/     # 副应用 (1920x1080, 蓝色)
│   │       ├── App.js         # 副应用组件（含SharedWorker通信）
│   │       ├── App.css        # 副应用样式
│   │       └── index.js       # 副应用入口
│   ├── worker.js              # SharedWorker实现双屏通信
│   └── index.js               # 原动态入口文件（已弃用）
├── public/                     # 公共资源目录
│   ├── main/                  # 主应用HTML模板
│   │   └── index.html         # 主应用HTML
│   └── secondary/             # 副应用HTML模板
│       └── index.html         # 副应用HTML
├── webpack.config.js          # Webpack多入口配置
├── package.json               # 项目配置
└── README.md                  # 项目说明
```

## 启动方式
```bash
npm start
```

## 访问地址
- 主网页：http://localhost:3000/main.html (3840x2160, 红色背景)
- 副网页：http://localhost:3000/secondary.html (1920x1080, 蓝色背景)

## 技术特点
1. **Webpack多入口**：同时构建主应用和副应用，共享SharedWorker
2. **SharedWorker通信**：实现两个页面间的实时消息传递
3. **单服务器架构**：使用一个webpack dev server同时服务两个页面
4. **响应式设计**：适配不同分辨率（4K和1080p）
5. **实时同步**：两个页面可以实时发送和接收消息

## 双屏通信功能
- 主网页和副网页通过SharedWorker进行实时通信
- 支持双向消息传递
- 自动连接检测和状态同步
- 页面关闭时自动清理连接

## 与test目录的对比
- **相同点**：都使用webpack多入口和SharedWorker实现双屏联动
- **不同点**：本项目使用React框架，test目录使用原生JavaScript
- **优势**：更现代的React架构，更好的组件化开发体验
