import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { drawImageOnCanvas, setupDrawingContext } from './canvasUtils';

/**
 * Canvas 背景组件
 * @param {string} selectedImage - 选中的图片路径
 * @param {Function} onClick - 点击回调函数
 * @param {Function} onDrawingChange - 绘画状态变化回调
 * @param {string} brushColor - 画笔颜色，默认 '#000000'
 * @param {number} width - canvas 宽度，默认 1920
 * @param {number} height - canvas 高度，默认 1080
 */
const CanvasBackground = forwardRef(({ 
  selectedImage, 
  onClick,
  onDrawingChange,
  brushColor = '#000000',
  width = 1920,
  height = 1080 
}, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const undoFunctionRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  // 暴露 canvas 引用给父组件
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getCanvasDataURL: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png');
      }
      return null;
    }
  }));

  // 保存当前画布状态到历史记录
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    
    setDrawingHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndexRef.current + 1);
      newHistory.push(imageData);
      historyRef.current = newHistory;
      return newHistory;
    });
    
    setHistoryIndex(prevIndex => {
      const newIndex = prevIndex + 1;
      historyIndexRef.current = newIndex;
      return newIndex;
    });
  }, []);

  // 撤销上一步
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = historyRef.current[historyIndexRef.current - 1];
        
        // 使用 requestAnimationFrame 来平滑地恢复画布状态
        requestAnimationFrame(() => {
          // 先清除画布，避免闪烁
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 然后恢复图像数据
          ctx.putImageData(imageData, 0, 0);
          
          setHistoryIndex(prevIndex => {
            const newIndex = prevIndex - 1;
            historyIndexRef.current = newIndex;
            return newIndex;
          });
        });
      }
    }
  }, []);

  // 在 canvas 上绘制指定的图片
  useEffect(() => {
    const drawImage = async () => {
      if (!selectedImage) return;
      
      const canvas = canvasRef.current;
      if (canvas) {
        try {
          await drawImageOnCanvas(canvas, selectedImage, width, height, brushColor);
          console.log('Canvas image drawn successfully');
          
          // 保存初始状态到历史记录
          const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
          setDrawingHistory([imageData]);
          setHistoryIndex(0);
          historyRef.current = [imageData];
          historyIndexRef.current = 0;
        } catch (error) {
          console.error('Failed to draw image on canvas:', error);
        }
      }
    };

    drawImage();
  }, [selectedImage, width, height, brushColor]);

  // 设置撤销函数引用
  useEffect(() => {
    undoFunctionRef.current = undo;
  }, [undo]);

  // 暴露撤销函数给父组件
  useEffect(() => {
    if (onClick) {
      onClick(undoFunctionRef.current);
    }
  }, [onClick]);

  // 通知父组件绘画状态变化 - 使用 useEffect 延迟调用
  useEffect(() => {
    if (onDrawingChange && historyIndex >= 0) {
      onDrawingChange(historyIndex > 0, historyIndex > 0);
    }
  }, [historyIndex, onDrawingChange]);

  // 获取鼠标/触摸位置
  const getEventPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      // 触摸事件
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      // 鼠标事件
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  }, []);

  // 开始绘画
  const startDrawing = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const pos = getEventPos(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      // 重新设置画笔样式，确保使用最新的颜色
      setupDrawingContext(ctx, brushColor);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }, [getEventPos, brushColor]);

  // 绘画中
  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const pos = getEventPos(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }, [isDrawing, getEventPos]);

  // 结束绘画
  const stopDrawing = useCallback((e) => {
    e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      // 使用 setTimeout 延迟保存，避免在渲染过程中调用 setState
      setTimeout(() => {
        saveToHistory();
      }, 0);
    }
  }, [isDrawing, saveToHistory]);

  // 手动添加事件监听器（非被动）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 添加非被动的事件监听器
    const options = { passive: false };
    
    canvas.addEventListener('touchstart', startDrawing, options);
    canvas.addEventListener('touchmove', draw, options);
    canvas.addEventListener('touchend', stopDrawing, options);

    return () => {
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  return (
    <canvas 
      ref={canvasRef}
      className="background-canvas"
      width={width}
      height={height}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{
        cursor: 'crosshair',
        touchAction: 'none',
        imageRendering: 'auto' // 优化图像渲染
      }}
    />
  );
});

CanvasBackground.displayName = 'CanvasBackground';

export default CanvasBackground;
