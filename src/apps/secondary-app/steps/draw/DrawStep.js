import React, { useEffect, useRef, useState, useCallback } from 'react';
import './DrawStep.css';
import CanvasBackground from './CanvasBackground';

// 导入所有图片
import image1 from './images/1.png';
import image2 from './images/2.png';
import image3 from './images/3.png';
import image4 from './images/4.png';
import image5 from './images/5.png';
import image6 from './images/6.png';
import image7 from './images/7.png';
import image8 from './images/8.png';
import image9 from './images/9.png';
import image10 from './images/10.png';

const buttonList = [
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
  [{ x: 100, y: 100, color: 'red' }, { x: 100, y: 100, color: 'red' }],
]

// 压缩图片的辅助函数
const compressImage = (canvas, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve) => {
    // 计算压缩后的尺寸
    let { width, height } = canvas;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    // 创建临时 canvas 进行压缩
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // 绘制压缩后的图像
    tempCtx.drawImage(canvas, 0, 0, width, height);
    
    // 转换为压缩的 base64
    const compressedDataURL = tempCanvas.toDataURL('image/jpeg', quality);
    resolve(compressedDataURL);
  });
};

// 发送消息到主屏的函数
const sendMessageToMainScreen = (message) => {
  try {
    // 使用 localStorage 作为消息传递机制
    localStorage.setItem('mainScreenMessage', JSON.stringify({
      type: 'drawingComplete',
      timestamp: Date.now(),
      data: message
    }));
    
    // 触发 storage 事件，让主屏知道有新消息
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'mainScreenMessage',
      newValue: JSON.stringify({
        type: 'drawingComplete',
        timestamp: Date.now(),
        data: message
      })
    }));
    
    console.log('Message sent to main screen:', message);
  } catch (error) {
    console.error('Failed to send message to main screen:', error);
  }
};

function DrawStep({ onNext, onTimeoutToStart }) {
  const timeoutRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const undoFunctionRef = useRef(null);
  const canvasBackgroundRef = useRef(null);

  // 图片数组 - 使用 useMemo 避免每次渲染都创建新数组
  const images = React.useMemo(() => [
    image1, image2, image3, image4, image5,
    image6, image7, image8, image9, image10
  ], []);

  useEffect(() => {
    // 随机选择一张图片
    const randomIndex = Math.floor(Math.random() * images.length);
    setSelectedImage(images[randomIndex]);
    setIsImageSelected(true);

    // 进入页面后立即开始1分钟计时
    timeoutRef.current = setTimeout(() => {
      onTimeoutToStart(); // 超时后直接回到 start 页面
    }, 60000);

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTimeoutToStart, images]);

  // 重置定时器的函数
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onTimeoutToStart(); // 超时后直接回到 start 页面
    }, 60000);
  }, [onTimeoutToStart]);

  // 处理绘画状态变化 - 使用 useCallback 避免每次渲染都创建新函数
  const handleDrawingChange = useCallback((hasDrawing, canUndoNow) => {
    setCanUndo(canUndoNow);
  }, []);

  // 处理撤销功能 - 使用 useCallback 避免每次渲染都创建新函数
  const handleUndo = useCallback((undoFn) => {
    undoFunctionRef.current = undoFn;
  }, []);

  // 执行撤销
  const executeUndo = useCallback(() => {
    if (undoFunctionRef.current) {
      undoFunctionRef.current();
    }
  }, []);

  // 保存 canvas 为图片并传递到主屏
  const saveCanvasAndProceed = useCallback(async () => {
    if (canvasBackgroundRef.current) {
      try {
        // 获取 canvas 元素
        const canvas = canvasBackgroundRef.current.getCanvas();
        
        if (canvas) {
          console.log('开始生成图片...');
          
          // 压缩图片以减少存储空间
          const compressedImageData = await compressImage(canvas, 0.7, 1920, 1080);
          
          console.log('图片生成完成，大小:', Math.round(compressedImageData.length / 1024), 'KB');
          
          // 尝试保存到 localStorage
          try {
            localStorage.setItem('drawnCanvasImage', compressedImageData);
            console.log('图片已保存到 localStorage');
          } catch (storageError) {
            console.warn('localStorage quota exceeded, using sessionStorage instead');
            // 如果 localStorage 失败，尝试使用 sessionStorage
            try {
              sessionStorage.setItem('drawnCanvasImage', compressedImageData);
              console.log('图片已保存到 sessionStorage');
            } catch (sessionError) {
              console.error('Both localStorage and sessionStorage failed:', sessionError);
              // 如果都失败，使用全局变量作为备选方案
              window.drawnCanvasImage = compressedImageData;
              console.log('图片已保存到全局变量');
            }
          }
          
          // 发送消息到主屏，通知图片生成完成
          sendMessageToMainScreen({
            imageData: compressedImageData,
            message: '画图完毕，请展示图片'
          });
          
          console.log('已发送消息到主屏');
        } else {
          console.warn('Canvas not found');
        }
        
        // 继续到下一步
        onNext();
      } catch (error) {
        console.error('Failed to save canvas as image:', error);
        // 即使保存失败也继续到下一步
        onNext();
      }
    } else {
      // 如果没有 canvas 引用，直接继续
      onNext();
    }
  }, [onNext]);

  // 如果图片还没有选择好，不渲染组件
  if (!isImageSelected || !selectedImage) {
    return (
      <div className="draw-step">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="draw-step">
      <CanvasBackground
        ref={canvasBackgroundRef}
        selectedImage={selectedImage}
        onClick={handleUndo}
        onDrawingChange={handleDrawingChange}
        width={1920}
        height={1080}
      />
      <div
        className="cancel-button"
        onClick={executeUndo}
      >
        取消
      </div>
      <div className="next-button" onClick={saveCanvasAndProceed}>
        下一步
      </div>
    </div>
  );
}

export default DrawStep;
