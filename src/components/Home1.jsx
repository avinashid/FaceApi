import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Webcam from "react-webcam";
import ml5 from "ml5";
import Loader from "../components/Loader";
import Scan from "./Scan";
import { motion, AnimatePresence } from "framer-motion";

import * as faceapi from "face-api.js";

function Home({ setCamera, captureVideo, setCaptureVideo, setSuccess }) {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const [validate, setValidate] = useState({
    face: 0,
    validatePosture: 0,
  });

  const videoRef = useRef();
  const svgRef = useRef();

  // const videoHeight = 480;
  const videoWidth = window.innerWidth > 640 ? 640 : window.innerWidth - 60;

  const videoHeight =
    window.innerWidth < window.innerHeight
      ? (videoWidth * 125) / 100
      : (videoWidth * 75) / 100;

  function calculateDistance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  useEffect(() => {
    const loadModels = async () => {
      // const MODEL_URL = "/models";

      Promise.all([ml5.poseNet()]).then(() => {
        setModelsLoaded(true);
      });
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
  };

  const poseNetFunc = async ({ nose, eyeline, shoulderLine }) => {
    let faceDetection = 0;
    let postureDetection = 0;
    try {
      const pose = await ml5.poseNet(videoRef.current.video);

      pose.on("pose", (e) => {
        const result = e[0]?.pose;
        if (result) {
          // eyeline
          //   .attr("x1", result.leftEar.x)
          //   .attr("y1", result.leftEar.y)
          //   .attr("x2", result.rightEar.x)
          //   .attr("y2", result.rightEar.y)
          //   .attr("stroke", "red")
          //   .attr("stroke-width", 2);

          const data = {
            noseToRightEar: calculateDistance(result.nose, result.rightEar),
            noseToLeftEar: calculateDistance(result.nose, result.leftEar),
            rightEarToLeftEar: calculateDistance(
              result.rightEar,
              result.leftEar
            ),
          };

          shoulderLine
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .transition()
            .duration(120)
            .attr("x1", result.leftShoulder.x)
            .attr("y1", result.leftShoulder.y)
            .attr("x2", result.rightShoulder.x)
            .attr("y2", result.rightShoulder.y);

          nose
            .attr("stroke", "white")
            .transition()
            .duration(120)
            .attr("r", (data.rightEarToLeftEar * 67) / 100)
            .attr("cx", result.nose.x)
            .attr("cy", result.nose.y);

          // Check face detection
          if (result.score > 0.22) {
            if (faceDetection > 0) faceDetection = 0;
            else faceDetection--;
          } else faceDetection++;

          if (faceDetection < -20) {
            setValidate((prevState) => ({ ...prevState, face: 1 }));
            postureDetection = -1;
            faceDetection = -2;
          }
          if (faceDetection > 20) {
            setValidate((prevState) => ({ ...prevState, face: -1 }));
          }

          const checkAlignment =
            data.rightEarToLeftEar -
              (data.noseToLeftEar + data.noseToRightEar) >
            -6.5
              ? 1
              : -1;

          // console.log(
          //   data.rightEarToLeftEar - (data.noseToLeftEar + data.noseToRightEar)
          // );
          if (checkAlignment > 0) {
            if (postureDetection > 0) postureDetection = 0;
            else postureDetection--;
          } else postureDetection++;

          if (postureDetection <= -20 && faceDetection <= -20) {
            setValidate((prevState) => ({ ...prevState, validatePosture: 1 }));
          }
          if (postureDetection > 20)
            setValidate((prevState) => ({ ...prevState, validatePosture: -1 }));

          // console.log(checkAlignment);
          console.log(faceDetection, postureDetection);
          // console.log(data);
          // console.log(result);
        } else {
          console.log("error");
          setValidate((prevState) => ({ ...prevState, face: -1 }));
        }
      });
      // resolve(null);
    } catch (error) {
      return { face: false, data: [] };
    }
  };

  const handleVideo = async (video) => {
    let count = 0;

    // Draw the detections
    const svg = d3.select(svgRef.current).append("g");
    const eyeline = svg.append("line");
    const shoulderLine = svg.append("line");
    const nose = svg
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", "none")
      .attr("stroke-width", "2px")
      .attr("opacity", 0.7);

    console.log(count++, "count");

    if (video) {
      try {
        poseNetFunc({
          eyeline,
          shoulderLine,
          nose,
        });
      } catch (error) {
        setCaptureVideo(false);
        return;
      }
    }
  };

  const closeWebcam = () => {
    setCaptureVideo(false);
    setValidate({ face: 0, validatePosture: 0 });
  };

  return (
    <>
      {modelsLoaded ? (
        <>
          <div className=" m-auto mb-5">
            {captureVideo ? (
              <motion.button
                className="bg-slate-950 py-2 px-5 rounded-xl text-white font-semibold "
                initial={{ opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeWebcam}
              >
                Close Webcam
              </motion.button>
            ) : (
              <motion.button
                className="bg-slate-950 py-2 px-5 rounded-xl text-white font-semibold "
                initial={{ opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1000 }}
                onClick={startVideo}
              >
                Open Webcam
              </motion.button>
            )}
          </div>
          {captureVideo && (
            <div className="flex flex-row gap-12 justify-center  items-center flex-wrap w-full">
              <div className="relative ">
                <motion.div
                  initial={{ scale: 0, x: -1600 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "tween" }}
                  className={`bg-black rounded-xl relative z-20 `}
                  style={{ height: videoHeight }}
                >
                  <div className="w-full h-full absolute top-0 -z-10 ">
                    <Loader />
                  </div>

                  <Webcam
                    audio={false}
                    height={videoHeight}
                    width={videoWidth}
                    ref={videoRef}
                    onUserMedia={handleVideo}
                    onUserMediaError={() => setCamera(true)}
                    className="rounded-3xl overflow-hidden z-20"
                  />
                </motion.div>
                <svg
                  className="absolute z-40 top-0"
                  ref={svgRef}
                  width={videoWidth}
                  height={videoHeight}
                ></svg>
              </div>
              <div className="z-20">
                <Scan setSuccess={setSuccess} validate={validate} />
              </div>
            </div>
          )}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default Home;
