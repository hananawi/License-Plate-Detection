import { useEffect, useRef, useState } from "react";

import "./index.scss";
import ImageUploader from "../ImageUploader";
import { requestVisionApi } from "../../App";

function ImageDetection() {
  const [imgInfo, setImgInfo] =
    useState<{ src: string; filename: string }>(null); // src is dataurl
  const [detectedText, setDetectedText] = useState<string>(null);

  const imageUploaderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket>(null);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8765/image");

    return () => {
      wsRef.current.close(1000);
    };
  }, []);

  useEffect(() => {
    wsRef.current.addEventListener("message", handleMessage);

    return () => {
      wsRef.current.removeEventListener("message", handleMessage);
    };
  }, [imgInfo]);

  function handleMessage({ data }) {
    data = JSON.parse(data);
    console.log(data);

    // new Promise((res) => window.setTimeout(res, 1000))
    requestVisionApi(data.cropped_img)
      .then((text) => {
        const ctx = canvasRef.current.getContext("2d");
        const img = document.createElement("img");
        img.onload = function (this: HTMLImageElement) {
          canvasRef.current.width = this.width;
          canvasRef.current.height = this.height;

          ctx.drawImage(this, 0, 0, this.width, this.height);
          const xmin = data.result_json.xmin[0];
          const ymin = data.result_json.ymin[0];
          const xmax = data.result_json.xmax[0];
          const ymax = data.result_json.ymax[0];

          ctx.strokeStyle = "#48ff00";
          ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
          setDetectedText(text);
        };
        img.src = imgInfo.src;
      })
      .catch((err) => console.log(err));

    // for canvas init render, or canvasRef.current will be null
    setDetectedText(data.result_text);
  }

  function handleResetClick() {
    setImgInfo(null);
    setDetectedText(null);
  }

  function handleSubmitClick() {
    const base64String = imgInfo.src.slice(imgInfo.src.indexOf(",") + 1);
    wsRef.current.send(base64String);
  }

  return (
    <div className="image-detection">
      {/* {imgSrc ?? <img src={imgSrc} alt='user uploaded img'></img>} */}
      {detectedText === null || detectedText === undefined ? (
        <ImageUploader
          parentRef={imageUploaderRef}
          parentInputRef={inputRef}
          imgInfo={imgInfo}
          setImgInfo={setImgInfo}
        />
      ) : (
        <canvas ref={canvasRef}></canvas>
      )}
      <div className="buttons">
        <button onClick={handleResetClick}>reset</button>
        <button onClick={handleSubmitClick}>submit</button>
      </div>
      {detectedText !== null && detectedText !== undefined && (
        <div className="detection-text-result">检测结果: {detectedText}</div>
      )}
    </div>
  );
}

export default ImageDetection;
