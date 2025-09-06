import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backgroundColor, setBackgroundColor] = useState('#ff0000');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [counter, setCounter] = useState(0);
  const [showDrawingMessage, setShowDrawingMessage] = useState(false);

  // 监听来自副屏的消息
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'mainScreenMessage') {
        try {
          const message = JSON.parse(e.newValue);
          if (message.type === 'drawingComplete') {
            console.log('收到绘画完成消息:', message.data.message);
            
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
    
    // 如果没有保存的图片，使用原来的颜色切换逻辑
    if (!savedCanvasImage) {
      const colors = [
        '#ff0000', // 红色
        '#00ff00', // 绿色
        '#0000ff', // 蓝色
        '#ffff00', // 黄色
        '#ff00ff', // 洋红
        '#00ffff', // 青色
        '#ff8000', // 橙色
        '#8000ff', // 紫色
        '#00ff80', // 青绿色
        '#ff0080', // 粉红色
        '#80ff00', // 黄绿色
        '#0080ff', // 天蓝色
      ];

      const changeColor = () => {
        const randomIndex = Math.floor(Math.random() * colors.length);
        setBackgroundColor(colors[randomIndex]);
        setCounter(prev => prev + 1);
      };

      // 立即设置初始颜色
      changeColor();

      // 每5秒更换颜色
      const interval = setInterval(changeColor, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  // 如果有背景图片，使用图片；否则使用颜色
  const backgroundStyle = backgroundImage 
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        backgroundColor: backgroundColor
      };

  return (
    <div 
      className="main-app" 
      style={backgroundStyle}
    > 
      <div style={{ 
        position: 'absolute', 
        top: '50px', 
        left: '50px', 
        color: 'white', 
        fontSize: '60px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        fontFamily: 'Arial, sans-serif'
      }}>
        {backgroundImage ? '绘画作品展示' : `热更新测试 - 颜色切换次数: ${counter}`}
      </div>
    </div>
  );
}

export default App;
