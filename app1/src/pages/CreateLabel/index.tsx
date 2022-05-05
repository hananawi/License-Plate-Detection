import { useEffect, useRef, useState } from "react";

import './index.scss';

function App() {

    useEffect(() => {
        ctx = canvasRef.current.getContext('2d');
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mouseDownFlag = useRef<boolean>(false);
    const startX = useRef<number>(null);
    const startY = useRef<number>(null);
    const endX = useRef<number>(null);
    const endY = useRef<number>(null);

    const [rectActive, setRectActive] = useState<boolean>(true);
    const [imgSrc, setImgSrc] = useState<string>('');
    const [filename, setFilename] = useState<string>('');

    let ctx: CanvasRenderingContext2D = null;
    const canvasWidth = Math.min(window.innerWidth, window.innerHeight) * 0.6;
    const canvasHeight = canvasWidth

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = fileInputRef.current.files[0];
        // const img = document.createElement('img');
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            // img.src = e.target.result as string;
            typeof e.target.result === 'string' && setImgSrc(e.target.result);
            setFilename(fileInputRef.current.files[0].name);
        }
        // img.onload = function () {
        // const width = canvasRef.current.width;
        // const height = canvasRef.current.height;
        // ctx.drawImage(img, 0, 0, width, height);
        // }
        fileReader.readAsDataURL(file);
    }

    function handleUploadClick() {
        if (imgSrc) {
            return;
        }
        fileInputRef.current.click();
    }

    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        if (!rectActive || !imgSrc) {
            return;
        }
        mouseDownFlag.current = true;
        startX.current = e.nativeEvent.offsetX;
        startY.current = e.nativeEvent.offsetY;
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        if (!mouseDownFlag.current) {
            return;
        }
        console.log(startX.current, startY.current);
        draw(e.nativeEvent.offsetX - startX.current, e.nativeEvent.offsetY - startY.current);
    }

    function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        mouseDownFlag.current = false;
        endX.current = e.nativeEvent.offsetX;
        endY.current = e.nativeEvent.offsetY;
    }

    function draw(x: number, y: number) {
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        ctx.clearRect(0, 0, width, height);

        ctx.strokeRect(startX.current, startY.current, x, y);
    }

    function handleSaveClick() {
        if (!imgSrc) {
            return;
        }

        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const link = document.createElement('a');
        link.download = `${filename.slice(0, filename.lastIndexOf('.'))}.txt`;

        const normalizedCenterX = (startX.current + endX.current) / 2 / width;
        const normalizedCenterY = (startY.current + endY.current) / 2 / height;
        const normalizedWidth = (endX.current - startX.current) / width;
        const normalizedHeight = (endY.current - startY.current) / height;
        const blob = new Blob(
            [`0\t${normalizedCenterX}\t${normalizedCenterY}\t${normalizedWidth}\t${normalizedHeight}`],
            { type: 'text/plain' }
        );
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function handleRectClick() {
        if (!imgSrc) {
            return;
        }
        setRectActive(prev => !prev);
    }

    function handleClearClick() {
        setImgSrc('');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    return (
        <div className="create-labels">
            {imgSrc && <img src={imgSrc} alt="img preview"></img>}
            {!imgSrc && <ImgSvg />}
            <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight}
                onClick={handleUploadClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}>
                canvas api is not available:(
            </canvas>
            {
                imgSrc &&
                <>
                    <div className="filename">{filename}</div>
                    <div className="menu">
                        <button onClick={handleClearClick}>Clear</button>
                        <button onClick={handleRectClick}>Rect: {rectActive.toString()}</button>
                        <button onClick={handleSaveClick}>Save txt</button>
                    </div>
                </>
            }
            <input type="file" accept="image/*" id="image" name="image" ref={fileInputRef} onChange={handleFileChange}></input>
        </div>
    );
}

export default App;

function ImgSvg() {
    return <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" /></svg>;
}
