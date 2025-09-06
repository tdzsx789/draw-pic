const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 5260;

// 启用CORS
app.use(cors());

// 确保D盘stored_images文件夹存在
const uploadDir = 'D:\\stored_images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('已创建文件夹:', uploadDir);
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 使用原始文件名，如果已存在则添加时间戳
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 处理图片上传的API端点
app.post('/storeImage', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const uploadedFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    console.log('文件上传成功:', uploadedFile);

    res.json({
      success: true,
      message: '文件上传成功',
      uploadedFile: uploadedFile
    });

  } catch (error) {
    console.error('上传文件时出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
});

// 获取图片列表的API端点
app.get('/getImages', (req, res) => {
  try {
    // 检查文件夹是否存在
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        message: '文件夹不存在',
        images: []
      });
    }

    // 读取文件夹中的所有文件
    const files = fs.readdirSync(uploadDir);
    
    // 过滤出图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    // 生成图片URL列表
    const images = imageFiles.map(file => ({
      filename: file,
      url: `http://localhost:${PORT}/images/${file}`,
      path: path.join(uploadDir, file)
    }));

    console.log(`找到 ${images.length} 张图片`);

    res.json({
      success: true,
      message: `找到 ${images.length} 张图片`,
      images: images
    });

  } catch (error) {
    console.error('获取图片列表时出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
});

// 提供静态图片文件服务
app.use('/images', express.static(uploadDir));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超过限制(10MB)'
      });
    }
  }
  
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    message: '服务器错误: ' + error.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`图片上传服务器已启动，端口: ${PORT}`);
  console.log(`上传目录: ${uploadDir}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});

