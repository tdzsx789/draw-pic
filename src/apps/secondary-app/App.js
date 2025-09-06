import React, { useState } from 'react';
import './App.css';
import './steps/StepCommon.css';
import StartStep from './steps/start/StartStep';
import DrawStep from './steps/draw/DrawStep';
import EndStep from './steps/end/EndStep';

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

function App() {
  const [currentStep, setCurrentStep] = useState('start');

  const handleNext = () => {
    switch (currentStep) {
      case 'start':
        setCurrentStep('draw');
        break;
      case 'draw':
        setCurrentStep('end');
        break;
      case 'end':
        setCurrentStep('start');
        // 回到首页时发送消息给主屏，通知回到随机颜色状态
        sendMessageToMainScreen({
          message: '回到首页，请切换到随机颜色状态'
        });
        break;
      default:
        setCurrentStep('start');
        // 回到首页时发送消息给主屏，通知回到随机颜色状态
        sendMessageToMainScreen({
          message: '回到首页，请切换到随机颜色状态'
        });
    }
  };

  // 专门用于超时回到 start 页面的函数
  const handleTimeoutToStart = () => {
    setCurrentStep('start');
    // 超时回到首页时也发送消息给主屏
    sendMessageToMainScreen({
      message: '超时回到首页，请切换到随机颜色状态'
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'start':
        return <StartStep onNext={handleNext} />;
      case 'draw':
        return <DrawStep onNext={handleNext} onTimeoutToStart={handleTimeoutToStart} />;
      case 'end':
        return <EndStep onNext={handleNext} onTimeoutToStart={handleTimeoutToStart} />;
      default:
        return <StartStep onNext={handleNext} />;
    }
  };

  return (
    <div className="secondary-app">
      <div className="step-container">
        {renderCurrentStep()}
      </div>
    </div>
  );
}

export default App;
