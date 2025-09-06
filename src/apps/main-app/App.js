import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [backgroundColor, setBackgroundColor] = useState('#ff0000');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [showDrawingMessage, setShowDrawingMessage] = useState(false);
  const [storedImages, setStoredImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  // 获取图片列表的方法
  const fetchImages = () => {
    fetch('http://localhost:5260/getImages')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStoredImages(data.images);
          console.log('获取到图片列表:', data.images);
        } else {
          console.error('获取图片列表失败:', data.message);
          setStoredImages([]);
        }
      })
      .catch(error => {
        console.error('获取图片列表出错:', error);
        setStoredImages([]);
      });
  };

  // 监听来自副屏的消息
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'mainScreenMessage') {
        try {
          const message = JSON.parse(e.newValue);
          if (message.type === 'drawingComplete') {
            console.log('收到绘画完成消息:', message.data.message);

            // 检查是否是回到首页的消息
            if (message.data.message && message.data.message.includes('回到首页')) {
              console.log('收到回到首页消息，获取图片列表');
              // 清除背景图片，获取图片列表
              setBackgroundImage(null);
              setShowDrawingMessage(false);
              // 获取图片列表
              fetchImages();
              // 清除消息
              localStorage.removeItem('mainScreenMessage');
              return;
            }

            // 显示绘画完成消息
            setShowDrawingMessage(true);

            // 设置背景图片
            if (message.data.imageData) {
              setBackgroundImage(message.data.imageData);
              console.log('已设置绘画图片为背景');
            }

            // 3秒后隐藏消息
            setTimeout(() => {
              setShowDrawingMessage(false);
            }, 3000);

            // 清除消息
            localStorage.removeItem('mainScreenMessage');
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      }
    };

    // 监听 storage 事件
    window.addEventListener('storage', handleStorageChange);

    // 页面加载时也检查是否有消息
    const existingMessage = localStorage.getItem('mainScreenMessage');
    if (existingMessage) {
      handleStorageChange({
        key: 'mainScreenMessage',
        newValue: existingMessage
      });
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 检查是否有保存的 canvas 图片（兼容旧版本）
  useEffect(() => {
    // 尝试从多个存储位置读取保存的 canvas 图片
    let savedCanvasImage = null;

    // 1. 尝试从 localStorage 读取
    try {
      savedCanvasImage = localStorage.getItem('drawnCanvasImage');
      if (savedCanvasImage) {
        localStorage.removeItem('drawnCanvasImage'); // 清除数据
        setBackgroundImage(savedCanvasImage);
        setShowDrawingMessage(true);
        setTimeout(() => {
          setShowDrawingMessage(false);
        }, 3000);
        return;
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    // 2. 如果 localStorage 没有，尝试从 sessionStorage 读取
    if (!savedCanvasImage) {
      try {
        savedCanvasImage = sessionStorage.getItem('drawnCanvasImage');
        if (savedCanvasImage) {
          sessionStorage.removeItem('drawnCanvasImage'); // 清除数据
          setBackgroundImage(savedCanvasImage);
          setShowDrawingMessage(true);
          setTimeout(() => {
            setShowDrawingMessage(false);
          }, 3000);
          return;
        }
      } catch (error) {
        console.warn('Failed to read from sessionStorage:', error);
      }
    }

    // 3. 如果都没有，尝试从全局变量读取
    if (!savedCanvasImage && window.drawnCanvasImage) {
      savedCanvasImage = window.drawnCanvasImage;
      window.drawnCanvasImage = null; // 清除数据
      setBackgroundImage(savedCanvasImage);
      setShowDrawingMessage(true);
      setTimeout(() => {
        setShowDrawingMessage(false);
      }, 3000);
      return;
    }

    // 如果没有保存的图片，获取图片列表
    if (!savedCanvasImage) {
      fetchImages();
    }
  }, []);

  // 图片轮播逻辑
  useEffect(() => {
    if (storedImages.length > 0 && !backgroundImage) {
      const switchImage = () => {
        // 计算下一张图片的索引
        const newIndex = (currentImageIndex + 1) % storedImages.length;
        console.log('轮播切换:', currentImageIndex, '->', newIndex, '总图片数:', storedImages.length);
        setNextImageIndex(newIndex);
        setIsTransitioning(true);
        
        // 1秒后完成切换
        setTimeout(() => {
          setCurrentImageIndex(newIndex);
          setIsTransitioning(false);
        }, 1000);
      };

      // 清除之前的定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(switchImage, 5000); // 每5秒切换一张图片

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [storedImages, backgroundImage, currentImageIndex]);

  // 确定当前显示的背景
  const getCurrentBackground = () => {
    if (backgroundImage) {
      // 如果有绘画作品，显示绘画作品
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else if (storedImages.length > 0) {
      // 如果有存储的图片，轮播显示
      const currentImage = storedImages[currentImageIndex];
      return {
        backgroundImage: `url(${currentImage.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else {
      // 否则使用随机颜色
      return {
        backgroundColor: backgroundColor
      };
    }
  };

  const backgroundStyle = getCurrentBackground();
  
  // 获取下一张图片的背景样式
  const getNextBackground = () => {
    if (storedImages.length > 0) {
      const nextImage = storedImages[nextImageIndex];
      return {
        backgroundImage: `url(${nextImage.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {};
  };
  
  const nextBackgroundStyle = getNextBackground();


  return (
    <div className="main-app">
      {/* 背景底图 - 显示当前图片作为底图 */}
      <div 
        className="background-layer base"
        style={backgroundStyle}
      />
      {/* 当前显示的背景图片 */}
      <div 
        className={`background-layer current ${isTransitioning ? 'transitioning' : ''}`}
        style={backgroundStyle}
      />
      {/* 下一张背景图片，用于过渡 */}
      {storedImages.length > 0 && !backgroundImage && (
        <div 
          className={`background-layer next ${isTransitioning ? 'show' : ''}`}
          style={nextBackgroundStyle}
        />
      )}
    </div>
  );
}

export default App;
