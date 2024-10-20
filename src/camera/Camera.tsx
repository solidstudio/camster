import React, {useRef} from "react";
import { useGlobalContext } from "../GlobalContext";
import Webcam from "react-webcam";
import { getVideoConstraints, setupCanvasSize, renderVideoToCanvas, detectDocument } from "./CameraUtils";
import { animationManager } from "./AnimationManger";

const Camera = (config: any) => {

  const [globalData, setGlobalData] = useGlobalContext();

  const videoWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const videoConstraints = getVideoConstraints();

  const initialiseCanvas = () => {
    setupCanvasSize(videoRef, canvasRef, config);
  };

  const renderVideo = () => {
    renderVideoToCanvas(videoRef, canvasRef, config, globalData.autoCapture.lastDetectedPoints);
  };

  const runDetection = () => {
    detectDocument(videoRef, canvasRef, config, updatePointDetected);
  };

  const updatePointDetected = (points: any) => {
    const globalDataUpdate = globalData;
    globalDataUpdate.autoCapture.lastDetectedPoints = points;
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