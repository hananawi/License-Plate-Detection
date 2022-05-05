import { useRef, useState } from 'react';

import ImageSvg from '../../assets/ImageBlackIcon.svg';
import './index.scss';

function ImageUploader(props) {

  const { parentRef, parentInputRef,imgInfo, setImgInfo } = props;

  function handleClick() {
    parentInputRef.current.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = function () {
      typeof this.result === 'string' && setImgInfo({ src: this.result, filename: file.name });
    }
    fileReader.readAsDataURL(file);
  }

  return (
    <div className="image-uploader" onClick={handleClick} ref={parentRef}>
      {
        imgInfo ?
          <div className='preview'>
            <img src={imgInfo.src}></img>
            <div>{imgInfo.filename}</div>
          </div>
          :
          <div className='icon'>
            <img src={ImageSvg} alt='img icon'></img>
            <div className="desc">select an image or drag here</div>
          </div>
      }
      <input ref={parentInputRef} type='file' id='image' name='image' onChange={handleChange} style={{ display: 'none' }}></input>
    </div>
  );
}

export default ImageUploader;
