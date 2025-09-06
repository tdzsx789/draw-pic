/**
 * Canvas 绘制工具函数
 */

/**
 * 在 canvas 上绘制图片
 * @param {HTMLCanvasElement} canvas - canvas 元素
 * @param {string} imageSrc - 图片源路径
 * @param {number} width - canvas 宽度，默认 1920
 * @param {number} height - canvas 高度，默认 1080
 * @param {string} brushColor - 画笔颜色，默认 '#ff0000'
 * @returns {Promise} - 返回绘制完成的 Promise
 */
export const drawImageOnCanvas = (canvas, imageSrc, width = 1920, height = 1080, brushColor = '#ff0000') => {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error('Canvas element is required'));
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Unable to get 2D context from canvas'));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      try {
        // 设置 canvas 尺寸
        canvas.width = width;
        canvas.height = height;
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制图片，使用 cover 模式（填满整个画布）
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 设置绘画样式
        setupDrawingContext(ctx, brushColor);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageSrc}`));
    };
    
    img.src = imageSrc;
  });
};

/**
 * 设置绘画上下文样式
 * @param {CanvasRenderingContext2D} ctx - canvas 2D 上下文
 * @param {string} brushColor - 画笔颜色，默认 '#ff0000'
 */
export const setupDrawingContext = (ctx, brushColor = '#ff0000') => {
  ctx.lineWidth = 3; // 改为 3px
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = brushColor; // 使用传入的颜色
  ctx.globalCompositeOperation = 'source-over';
};

/**
 * 清除 canvas 画布
 * @param {HTMLCanvasElement} canvas - canvas 元素
 */
export const clearCanvas = (canvas) => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * 设置 canvas 尺寸
 * @param {HTMLCanvasElement} canvas - canvas 元素
 * @param {number} width - 宽度
 * @param {number} height - 高度
 */
export const setCanvasSize = (canvas, width, height) => {
  if (!canvas) return;
  
  canvas.width = width;
  canvas.height = height;
};
