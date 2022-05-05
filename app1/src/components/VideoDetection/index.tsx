import { useEffect, useRef, useState } from "react";
import { requestVisionApi } from "../../App";
import "./index.scss";

function VideoDetection() {
  useEffect(() => {
    function initWebSocket() {
      wsRef.current = new WebSocket("ws://localhost:8765/video");
      // wsImageRef.current = new WebSocket("ws://localhost:8765/image");
      let visionApiFlag = true; // true means ready to send request

      wsRef.current.addEventListener("message", function ({ data }) {
        // if (data[0] === '!') {
        //   console.log(data.slice(1));
        //   return;
        // }
        data = JSON.parse(data);
        const videoWidth = videoInfo.current.width;
        const videoHeight = videoInfo.current.height;
        if (!Object.keys(data).length) {
          ctxRef.current.clearRect(0, 0, videoWidth, videoHeight);
          setDetectedText(null);
          return;
        }
        console.log(data);

        if (visionApiFlag && data.cropped_img) {
          requestVisionApi(data.cropped_img).then((text) => {
            setDetectedText(text);
            // allow to send again delaying 2s after receiving the response
            window.setTimeout(() => (visionApiFlag = true), 2000);
          });
          visionApiFlag = false;
        }

        const { xmin, ymin, xmax, ymax, name } = data.result_json;
        for (let i = 0; i < Object.keys(xmin).length; i++) {
          ctxRef.current.clearRect(0, 0, videoWidth, videoHeight);

          const x = (xmin[i] / canvas.width) * videoWidth;
          const y = (ymin[i] / canvas.height) * videoHeight;
          const width = ((xmax[i] - xmin[i]) / canvas.width) * videoWidth;
          const height = ((ymax[i] - ymin[i]) / canvas.height) * videoHeight;

          ctxRef.current.strokeRect(x, y, width, height);
          ctxRef.current.fillStyle = "#2ecc71";
          ctxRef.current.fillRect(
            x,
            y,
            rootFontSize * name[i].length,
            rootFontSize
          );
          ctxRef.current.fillStyle = "#34495e";
          ctxRef.current.fillText(name[i], x + 5, y + rootFontSize);
        }
      });

      // wsImageRef.current.addEventListener("message", function ({ data }) {
      // setDetectedText(data);
      // });
    }

    ctxRef.current = canvasRef.current.getContext("2d");

    initWebSocket();

    let timerId = 0;
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    const constraints = {
      video: true,
      audio: false,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        // console.log(stream.getTracks()[0].getSettings())
        const frameRate = Math.floor(
          stream.getVideoTracks()[0].getSettings().frameRate / 6
        );
        console.log("frameRate:", frameRate);
        const interval = Math.floor(1000 / frameRate);

        // callback in window.setTimeout
        function cb() {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/png");
          const base64String = dataUrl.slice(dataUrl.indexOf(",") + 1);
          wsRef.current.send(base64String);
          timerId = window.setTimeout(cb, interval);
        }
        cb();
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      wsRef.current.close(1000);
      // wsImageRef.current.close(1000);
      window.clearTimeout(timerId);
    };
  }, []);

  const rootFontSize = Number.parseInt(
    window.getComputedStyle(document.documentElement).fontSize
  ); // get rem

  const [detectedText, setDetectedText] = useState<string>(null);

  const streamRef = useRef<MediaStream>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>(null);
  const wsRef = useRef<WebSocket>(null);
  // const wsImageRef = useRef<WebSocket>(null);
  const videoInfo = useRef<{
    width: number;
    height: number;
    play: boolean;
  }>({
    width: 0,
    height: 0,
    play: false,
  });

  function handleVideoPlay() {
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctxRef.current.strokeStyle = "#2ecc71";
    ctxRef.current.fillStyle = "#2ecc71";
    ctxRef.current.font = `${rootFontSize}px monospace`;
    ctxRef.current.textBaseline = "bottom";

    videoInfo.current.width = videoRef.current.videoWidth;
    videoInfo.current.height = videoRef.current.videoHeight;
    videoInfo.current.play = true;
    console.log("video init");
  }

  return (
    <div className="video-detection">
      <video
        className="livestream"
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        onPlay={handleVideoPlay}
      ></video>
      <canvas ref={canvasRef}></canvas>
      {detectedText !== null && detectedText !== undefined && (
        <div className="detection-text-result">检测结果: {detectedText}</div>
      )}
    </div>
  );
}

export default VideoDetection;
