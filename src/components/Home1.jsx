import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Webcam from "react-webcam";
import ml5 from "ml5";
import Loader from "../components/Loader";
import Scan from "./Scan";
import { motion, AnimatePresence } from "framer-motion";

import * as faceapi from "face-api.js";

function Home({
  setError,
  setNoFace,
  setPosition,
  setCamera,
  captureVideo,
  setCaptureVideo,
}) {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const videoRef = useRef();
  const svgRef = useRef();

  // const videoHeight = 480;
  const videoWidth = window.innerWidth > 640 ? 640 : window.innerWidth - 60;
  const videoHeight = (videoWidth * 75) / 100;

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ml5.poseNet(),
      ]).then(() => {
        setModelsLoaded(true);
        console.log("Models loaded");
      });
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
  };

  const handleVideo = async (video) => {
    const displaySize = {
      width: videoWidth,
      height: videoHeight,
    };

    let count = 0;

    // Draw the detections
    const svg = d3.select(svgRef.current).append("g");
    faceapi.matchDimensions(videoRef.current, displaySize);

    const svgFaceBox = svg.append("g").append("rect");
    const svgFaceExpression = svg.append("g");

    // if (video) {
    //   console.log(videoRef.current.video);
    //   const detections = await faceapi
    //     .detectSingleFace(
    //       videoRef.current.video,
    //       new faceapi.TinyFaceDetectorOptions()
    //     )
    //     .withFaceLandmarks()
    //     .withFaceExpressions()
    //     .withFaceDescriptor()
    //     .withAgeAndGender();
    //   if (detections) {
    //     const resizedDetection = faceapi.resizeResults(detections, displaySize);

    //     console.log(resizedDetection);
    //   }
    // }

    const interval = setInterval(async () => {
      console.log(count++);
      if (video) {
        try {
          console.log(videoRef.current.video);
          const detections = await faceapi.detectSingleFace(
            videoRef.current.video,
            new faceapi.TinyFaceDetectorOptions()
          );
          // .withFaceLandmarks()
          // .withFaceExpressions()
          // .withFaceDescriptor()
          // .withAgeAndGender();

          const pose = await ml5.poseNet(videoRef.current.video);
          console.log(pose);
          pose.on("pose", (e) => {
            console.log(e);
            const result = e[0].pose;
            if (
              result.rightShoulder?.y < pose.leftShoulder?.y ||
              result.leftShoulder?.y < pose.rightShoulder?.y ||
              result.nose?.y > pose.leftEar?.y
            ) {
              alert("Please sit properly and look at the screen.");
            }
          });

          if (detections) {
            const resizedDetection = faceapi.resizeResults(
              detections,
              displaySize
            );

            // svg
            //   .append("g")
            //   .attr("transform", `translate(0, ${videoHeight}) scale(-1, 1)`)
            //   .selectAll("path")
            //   .data(resizedDetection.landmarks.positions)
            //   .enter()
            //   .append("path")
            //   .attr("d", d3.line()(d3.pairs(d, (p, q) => [p.x, -p.y])))
            //   .attr("fill", "none")
            //   .attr("stroke", "steelblue")
            //   .attr("stroke-width", 2);

            // Draw the expressions
            // svgFaceExpression
            //   .selectAll("circle")
            //   .data(resizedDetection.landmarks.positions)
            //   .join("circle")
            //   .attr("cx", (d) => d.x)
            //   .attr("cy", (d) => Math.abs(d.y))
            //   .attr("r", 2)
            //   .attr("fill", "green")
            //   .attr("opacity", 0.4);

            svgFaceBox
              .attr("x", resizedDetection.box.x)
              .attr("y", resizedDetection.box.y)
              .attr("width", resizedDetection.box.width)
              .attr("height", resizedDetection.box.height)
              .attr("fill", "none")
              .attr("stroke", "green")
              .attr("stroke-width", 2)
              .attr("opacity", 0.5);
          }
        } catch (error) {
          setCaptureVideo(false);
          clearInterval(interval);
          return;
        }
      }
    }, 300);
  };

  const closeWebcam = () => {
    setCaptureVideo(false);
  };

  useEffect(() => {
    console.log(videoRef.current);
  }, [videoRef]);

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
                <div
                  className={`bg-black rounded-xl relative z-20  w-[640px] h-[480px]`}
                >
                  <div className="w-full h-full absolute top-0 -z-10 ">
                    <Loader />
                  </div>

                  {/* <Webcam
                    audio={false}
                    height={videoHeight}
                    width={videoWidth}
                    ref={videoRef}
                    onUserMedia={handleVideo}
                    onUserMediaError={() => setCamera(true)}
                    className="rounded-3xl overflow-hidden z-20"
           
                  /> */}

                </div>
                <svg
                  className="absolute z-40 top-0"
                  ref={svgRef}
                  width={videoWidth}
                  height={videoHeight}
                ></svg>
              </div>
              <div className="z-20">
                <Scan />
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
