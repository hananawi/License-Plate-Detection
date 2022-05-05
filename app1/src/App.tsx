import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import CreateLable from "./pages/CreateLabel";
import Detect from "./pages/Detection";

import "./App.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/app1"
          element={
            <div className="app1">
              <Outlet />
            </div>
          }
        >
          <Route index element={<Detect />} />
          <Route path="create-label" element={<CreateLable />} />
          <Route path="*" element={<div>page not found:(</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

export function requestVisionApi(imgBase64) {
  return fetch(
    "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCs7a3C69UMSf8Sy2rPWNJzIF9uqX90jvg",
    {
      method: "post",
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imgBase64,
            },
            features: [
              {
                type: "TEXT_DETECTION",
              },
            ],
          },
        ],
      }),
    }
  )
    .then((res) => res.json())
    .then((json) => json.responses[0].textAnnotations[0].description)
    .catch((err) => {
      console.log(err);
    });
}
