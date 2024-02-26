import { useEffect, useState } from "react";
import Home1 from "./components/Home1";
import { m } from "framer-motion";
import Scan from "./components/Scan";
import Header from "./components/Header";
const App = () => {
  const [error, setError] = useState(false);
  const [noFace, setNoFace] = useState(false);
  const [position, setPosition] = useState(false);
  const [camera, setCamera] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);

  useEffect(() => {}, [error, noFace, position, camera]);
  return (
    <div className="">
      <Header />
      <div className="flex px-8 flex-col justify-center items-center mt-10">
        {camera ? (
          <div className="bg-red-600 rounded-xl animate-pulse duration-700  text-white font-semibold text-xl py-2 px-8">
            Permission Denied Please allow camera and refrsh the page.
          </div>
        ) : (
          <Home1
            setError={setError}
            setPosition={setPosition}
            setNoFace={setNoFace}
            setCamera={setCamera}
            captureVideo={captureVideo}
            setCaptureVideo={setCaptureVideo}
          />
        )}
      </div>
    </div>
  );
};

export default App;
