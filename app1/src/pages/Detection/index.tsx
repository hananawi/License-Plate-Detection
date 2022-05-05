import { useState } from "react";

import './index.scss';
import ImageDetection from "../../components/ImageDetection";
import VideoDetection from "../../components/VideoDetection";

const TAB_IMAGE = 0;
const TAB_VIDEO = 1;

function Detectioin() {

  const [tabState, setTabState] = useState(TAB_IMAGE);

  return (
    <div className="detection">
      <nav>
        <ul>
          <li className={tabState === TAB_IMAGE ? 'active' : undefined} onClick={() => setTabState(TAB_IMAGE)}>Image</li>
          <li className={tabState === TAB_VIDEO ? 'active' : undefined} onClick={() => setTabState(TAB_VIDEO)}>Video</li>
        </ul>
      </nav>
      <div className="content">
        {
          (function () {
            if (tabState === TAB_IMAGE) {
              return <ImageDetection />
            } else if (tabState === TAB_VIDEO) {
              return <VideoDetection />
            }
          })()
        }
      </div>
    </div>
  );
}

export default Detectioin;
