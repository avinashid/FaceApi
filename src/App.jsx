import { useEffect, useState } from "react";
import Home1 from "./components/Home1";
import { m } from "framer-motion";
import Scan from "./components/Scan";
import Header from "./components/Header";
const App = () => {
  const [camera, setCamera] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <div className="flex flex-col">
      <Header />
      {!success ? (
        <div className="flex px-8 flex-col justify-center items-center mt-10">
          {camera ? (
            <div className="bg-red-600 rounded-xl animate-pulse duration-700  text-white font-semibold text-xl py-2 px-8">
              Permission Denied Please allow camera and refrsh the page.
            </div>
          ) : (
            <Home1
              setCamera={setCamera}
              captureVideo={captureVideo}
              setCaptureVideo={setCaptureVideo}
              setSuccess={setSuccess}
            />
          )}
        </div>
      ) : (
        <div className="text-white m-auto my-4">Homepage</div>
      )}
    </div>
  );
};

export default App;
