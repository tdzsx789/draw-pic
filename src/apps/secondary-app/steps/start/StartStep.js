import React, { useState, useEffect } from 'react';
import './StartStep.css';
import start1 from './start_1.png';
import start2 from './start_2.png';

function StartStep({ onNext }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const images = [start1, start2];

  useEffect(() => {
    
    const interval = setInterval(() => {
      // 计算下一张图片的索引
      const newIndex = (currentImageIndex + 1) % images.length;
      setNextImageIndex(newIndex);
      setIsTransitioning(true);
      
      // 1秒后完成切换
      setTimeout(() => {
        setCurrentImageIndex(newIndex);
        setIsTransitioning(false);
      }, 1000);
    }, 5000); // 每10秒切换一次

    return () => {
      console.log('StartStep: 清理定时器');
      clearInterval(interval);
    };
  }, [currentImageIndex, images.length]);

  return (
    <div className="start-step" onClick={onNext}>
      {/* 当前显示的背景图片 */}
      <div 
        className={`background-image current ${isTransitioning ? 'transitioning' : ''}`}
        style={{
          backgroundImage: `url(${images[currentImageIndex]})`
        }}
      />
      {/* 下一张背景图片，用于过渡 */}
      <div 
        className={`background-image next ${isTransitioning ? 'show' : ''}`}
        style={{
          backgroundImage: `url(${images[nextImageIndex]})`
        }}
      />
    </div>
  );
}

export default StartStep;
