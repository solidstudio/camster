import React, {useRef} from "react";
import { useGlobalContext } from "./GlobalContext";
import { isMobile } from 'react-device-detect';
import Webcam from "react-webcam";
import DocPresets from "./docPresets"
import { getVideoConstraints, setupCanvasSize, renderVideoToCanvas, detectDocument } from "./CameraUtils";
import { animationManager } from "./AnimationManger";

const Camera = () => {

  let [globalData, setGlobalData] = useGlobalContext();
  if (!globalData) {
    globalData = {
      config: DocPresets.test
    }
  } else if (!globalData.config) {
    globalData.config = DocPresets.test;
  }
  console.log('globalData', globalData);

  console.log('isMobile', isMobile);

  const videoWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const videoConstraints = getVideoConstraints();

  const initialiseCanvas = () => {
    setupCanvasSize(videoRef, canvasRef, globalData.config);
  };

  const renderVideo = () => {
    renderVideoToCanvas(videoRef, canvasRef, globalData.config, globalData.autoCapture);
  };

  const runDetection = () => {
    detectDocument(videoRef, canvasRef, globalData.config, updatePointDetected);
  };

  const updatePointDetected = (points: any) => {
    const globalDataUpdate = globalData;
    globalDataUpdate.autoCapture = {
      lastDetectedPoints: points
    };
    setGlobalData(globalDataUpdate);
  };

  const videoStarted = () => {
    // seems to have issues on ios without delay
    setTimeout(() => {
      initialiseCanvas();
      animationManager.registerTask(renderVideo, 60);
      animationManager.registerTask(runDetection, 10);
    }, 2000);
  }

  return (
    <div>
      <div style={{position: 'relative'}}>
        <div ref={videoWrapperRef}><Webcam videoConstraints={videoConstraints} ref={videoRef} onUserMedia={videoStarted} style={{position: 'absolute'}} /></div>
        <div><canvas id="canvasOutput" ref={canvasRef} style={{position: 'absolute'}}></canvas></div>
      </div>
      {/* <div style={{position: 'relative'}}><Link to="/" reloadDocument>Back to settings</Link></div> */}
      <div style={{position: 'relative'}}><a href="/camster" >Back to settings</a></div>
    </div>
  );
}

export default Camera;