import React, { useState } from 'react';
import './App.css';
import './steps/StepCommon.css';
import StartStep from './steps/start/StartStep';
import DrawStep from './steps/draw/DrawStep';
import EndStep from './steps/end/EndStep';

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
        break;
      default:
        setCurrentStep('start');
    }
  };

  // 专门用于超时回到 start 页面的函数
  const handleTimeoutToStart = () => {
    setCurrentStep('start');
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
