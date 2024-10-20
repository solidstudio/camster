import React from "react";
import { isMobile } from 'react-device-detect';
import cv from "@techstark/opencv-js";

export const getVideoConstraints = () => {
    let videoConstraints = {
        facingMode: { exact: "user" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
    };
    if(isMobile) {
        videoConstraints = {
          facingMode: { exact: "environment" },
          width: { ideal: window.innerHeight },
          height: { ideal: window.screen.width } 
        };
      }
    return videoConstraints;
}

export const setupCanvasSize = (videoRef: any, canvasRef: any, config: any) => {
    const video = videoRef?.current?.video;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

export const renderVideoToCanvas = (videoRef: any, canvasRef: any, config: any, lastDetectedPoints: any) => {
    const canv = videoRef?.current?.getCanvas();
    if (canv) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(videoRef.current.video, 0, 0, canv.width, canv.height);

        const img = cv.imread(canvasRef.current);

        const boxWidth = Math.round(canv.width * (config.documentWidth / 100));
        const boxHeight = Math.round(canv.height * (config.documentHeight / 100));
        let topLeftPoints = { x: canv.width / 2 - boxWidth / 4, y: canv.height / 2 - boxHeight / 2};
        let bottomRightPoints = { x: canv.width / 2 + boxWidth / 4, y: canv.height / 2 + boxHeight / 2};
        if(isMobile) {
            topLeftPoints = { x: canv.width / 2 - boxWidth / 2, y: canv.height / 2 - boxHeight / 2};
            bottomRightPoints = { x: canv.width / 2 + boxWidth / 2, y: canv.height / 2 + boxHeight / 2};
        }


        const white = [255, 255, 255, 255]; // white
        cv.rectangle(img, topLeftPoints, bottomRightPoints, white, 2);

        if (lastDetectedPoints && config.debug) {
            const colorDebugRed = [255, 0, 0, 255]; // red
            cv.rectangle(img, lastDetectedPoints[0], lastDetectedPoints[2], colorDebugRed, 2);
        }

        cv.imshow(canvasRef.current, img);
        img.delete();
    }

};

export const detectDocument = (videoRef: any, canvasRef: any, config: any, updatePointDetected: any) => {
    const video = videoRef?.current?.video;
    // fixes bug https://github.com/opencv/opencv/issues/19922
    video.height = video.videoHeight;
    video.width = video.videoWidth;
    const cap = new cv.VideoCapture(video);
    const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(src);


    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    const blur = new cv.Mat();
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    cv.Canny(blur, blur, 50, 150);
    const thresh = new cv.Mat();
    cv.threshold(blur, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    cv.findContours(
      thresh,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE
    );

    let points: any = [];

    if (contours.size()) {
        let maxArea = 1000
        let maxContourIndex = -1
        for (let i = 0; i < contours.size(); ++i) {
            let contourArea = cv.contourArea(contours.get(i));
            if (contourArea > maxArea) {
            maxContourIndex = i
            }
        }

        if (maxContourIndex >= 0) {
            const maxContour = contours.get(maxContourIndex);
            const maxContourArea = cv.contourArea(maxContour);
            if (maxContourArea > maxArea) {
                points = getCornerPoints(maxContour);
            }
        }
    }

    src.delete();
    gray.delete();
    blur.delete();
    thresh.delete();
    contours.delete();
    hierarchy.delete();

    if (points[0] && points[2]) {
        updatePointDetected(points);
    }
    points = [];

};

export const getCornerPoints = (contour: any) => {
    let points = [];
    let rect = cv.minAreaRect(contour);
    const center = rect.center

    let topLeftPoint
    let topLeftDistance = 0

    let topRightPoint
    let topRightDistance = 0

    let bottomLeftPoint
    let bottomLeftDistance = 0

    let bottomRightPoint
    let bottomRightDistance = 0

    for (let i = 0; i < contour.data32S.length; i += 2) {
        const point = { x: contour.data32S[i], y: contour.data32S[i + 1] };
        const distance = Math.hypot(point.x - center.x, point.y - center.y);
        if (point.x < center.x && point.y < center.y) {
        if (distance > topLeftDistance) {
            topLeftPoint = point
            topLeftDistance = distance
        }
        } else if (point.x > center.x && point.y < center.y) {
        if (distance > topRightDistance) {
            topRightPoint = point
            topRightDistance = distance
        }
        } else if (point.x < center.x && point.y > center.y) {
        if (distance > bottomLeftDistance) {
            bottomLeftPoint = point
            bottomLeftDistance = distance
        }
        } else if (point.x > center.x && point.y > center.y) {
        if (distance > bottomRightDistance) {
            bottomRightPoint = point
            bottomRightDistance = distance
        }
        }
    }
    points.push(topLeftPoint)
    points.push(topRightPoint)
    points.push(bottomRightPoint)
    points.push(bottomLeftPoint)
    return points
};