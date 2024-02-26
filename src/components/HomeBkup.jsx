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
  const [validate, setValidate] = useState({
    face: 0,
    validatePosture: false,
  });

  const [face, setFace] = useState(false);

  const videoRef = useRef();
  const svgRef = useRef();

  // const videoHeight = 480;
  const videoWidth = window.innerWidth > 640 ? 640 : window.innerWidth - 60;
  const videoHeight = (videoWidth * 75) / 100;

  function calculateDistance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

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
    let faceDetection = 0;

    // Draw the detections
    const svg = d3.select(svgRef.current).append("g");
    faceapi.matchDimensions(videoRef.current, displaySize);

    const svgFaceBox = svg.append("g").append("rect");
    const svgFaceExpression = svg.append("g");
    const eyeline = svg.append("line");
    const shoulderLine = svg.append("line");
    const nose = svg
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", "2px")
      .attr("opacity", 0.7);

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
      console.log(count++, "count");
      if (video) {
        try {
          if (count > 150) clearInterval(interval);
          // const detections = await faceapi.detectSingleFace(
          //   videoRef.current.video,
          //   new faceapi.TinyFaceDetectorOptions()
          // );
          // .withFaceLandmarks()
          // .withFaceExpressions()
          // .withFaceDescriptor()
          // .withAgeAndGender();

          const pose = await ml5.poseNet(videoRef.current.video);

          pose.on("pose", (e) => {
            const result = e[0]?.pose;
            console.log(result);
            if (result) {
              eyeline
                .attr("x1", result.leftEar.x)
                .attr("y1", result.leftEar.y)
                .attr("x2", result.rightEar.x)
                .attr("y2", result.rightEar.y)
                .attr("stroke", "red")
                .attr("stroke-width", 2);

              const data = {
                noseToRightEar: calculateDistance(result.nose, result.rightEar),
                noseToLeftEar: calculateDistance(result.nose, result.leftEar),
                rightEarToLeftEar: calculateDistance(
                  result.rightEar,
                  result.leftEar
                ),
              };

              console.log(data, "corordinate");

              console.log(calculateDistance(result.leftEar, result.rightEar));

              shoulderLine
                .attr("x1", result.leftShoulder.x)
                .attr("y1", result.leftShoulder.y)
                .attr("x2", result.rightShoulder.x)
                .attr("y2", result.rightShoulder.y)
                .attr("stroke", "blue")
                .attr("stroke-width", 2);

              nose
                .attr("cx", result.nose.x)
                .attr("cy", result.nose.y)
                .attr("r", (data.rightEarToLeftEar * 60) / 100);
            }
          });
          // console.log(detections, "detection");
          // if (detections) {
          //   if (faceDetection > 0) faceDetection = 0;
          //   else faceDetection--;
          //   const resizedDetection = faceapi.resizeResults(
          //     detections,
          //     displaySize
          //   );

          //   // svg
          //   //   .append("g")
          //   //   .attr("transform", `translate(0, ${videoHeight}) scale(-1, 1)`)
          //   //   .selectAll("path")
          //   //   .data(resizedDetection.landmarks.positions)
          //   //   .enter()
          //   //   .append("path")
          //   //   .attr("d", d3.line()(d3.pairs(d, (p, q) => [p.x, -p.y])))
          //   //   .attr("fill", "none")
          //   //   .attr("stroke", "steelblue")
          //   //   .attr("stroke-width", 2);

          //   // Draw the expressions
          //   // svgFaceExpression
          //   //   .selectAll("circle")
          //   //   .data(resizedDetection.landmarks.positions)
          //   //   .join("circle")
          //   //   .attr("cx", (d) => d.x)
          //   //   .attr("cy", (d) => Math.abs(d.y))
          //   //   .attr("r", 2)
          //   //   .attr("fill", "green")
          //   //   .attr("opacity", 0.4);

          //   svgFaceBox
          //     .attr("x", resizedDetection.box.x)
          //     .attr("y", resizedDetection.box.y)
          //     .attr("width", resizedDetection.box.width)
          //     .attr("height", resizedDetection.box.height)
          //     .attr("fill", "none")
          //     .attr("stroke", "green")
          //     .attr("stroke-width", 2)
          //     .attr("opacity", 0.5);
          // }

          if (faceDetection < -2) {
            setValidate((prevState) => ({ ...prevState, face: 1 }));
          }

          // if (!detections) {
          //   faceDetection++;
          //   // console.log(faceDetection, "faceDee");
          //   // console.log(validate, "this dasdlf ");
          //   if (faceDetection > 10) {
          //     setValidate((prevState) => ({ ...prevState, face: -1 }));
          //   }
          // }
        } catch (error) {
          setCaptureVideo(false);
          clearInterval(interval);
          return;
        }
      }
    }, 400);
  };

  const closeWebcam = () => {
    setCaptureVideo(false);
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
                <div
                  className={`bg-black rounded-xl relative z-20  w-[640px] h-[480px]`}
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
                </div>
                <svg
                  className="absolute z-40 top-0"
                  ref={svgRef}
                  width={videoWidth}
                  height={videoHeight}
                ></svg>
              </div>
              <div className="z-20">
                <Scan validate={validate} />
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
