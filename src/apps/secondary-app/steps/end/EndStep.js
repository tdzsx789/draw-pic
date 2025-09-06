import React, { useEffect, useRef } from 'react';
import './EndStep.css';

function EndStep({ onNext, onTimeoutToStart }) {
  const timeoutRef = useRef(null);

  useEffect(() => {
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
  }, [onTimeoutToStart]);

  return (
    <div className="end-step" onClick={onTimeoutToStart}>
    </div>
  );
}

export default EndStep;
