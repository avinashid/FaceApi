import { useState, useEffect } from "react";
import FaceLoader from "./FaceLoader";
import { AnimatePresence, motion } from "framer-motion";
const Scan = ({ validate, setSuccess }) => {
  const [stage, setStage] = useState(1);
  const [error, setError] = useState(false);
  useEffect(() => {
    console.log(validate, "scan");
    switch (stage) {
      case 1:
        {
          if (validate.face > 0) {
            setStage(2);
            setError(false);
          }
          if (validate.face == -1) setError(true);
        }

        break;

      case 2: {
        if (validate.validatePosture > 0) {
          setStage(3);
          setError(false);
        }
        if (validate.validatePosture == -1) setError(true);
        break;
      }
      default:
        break;
    }
  }, [validate, stage]);

  useEffect(() => {
    if (stage == 3) {
      setTimeout(() => {
        setStage(4);
      }, 2000);
    }
  }, [stage]);

  return (
    <div className="flex flex-col self-end relative top-8  gap-4 items-center    h-full">
      <FaceLoader error={error} stage={stage} />
      <motion.div
        className="flex flex-col gap-4 relative -top-20  "
        initial={{ color: "white" }}
        animate={{ color: !error ? "white" : "red" }}
      >
        {stage >= 1 && (
          <div className="flex flex-row items-center gap-4">
            <div
              className={`rounded-full w-2 h-2 bg-white ${
                stage == 1 && "animate-ping"
              }`}
            ></div>
            Detecting face...
          </div>
        )}
        {stage >= 2 && (
          <motion.div className="flex flex-row items-center gap-4">
            <div
              className={`rounded-full w-2 h-2 bg-white ${
                stage == 2 && "animate-ping"
              }`}
            ></div>
            Detecting posture...
          </motion.div>
        )}
        {stage >= 3 && (
          <div className="flex flex-row items-center gap-4">
            <div
              className={`rounded-full w-2 h-2 bg-white ${
                stage == 3 && "animate-ping"
              }`}
            ></div>
            Validating all...
          </div>
        )}
        <AnimatePresence>
          {(stage == 4 || error) && (
            <motion.button
              initial={{ opacity: 0 }}
              className=" cursor-pointer bg-red-600 text-white rounded-lg py-2 px-6 "
              animate={{ backgroundColor: error ? "red" : "green", opacity: 1 }}
              // transition={{ duration: 100 }}
              onClick={() => {
                if (error) {
                  setError(false);
                  setStage(1);
                } else {
                  setSuccess(true);
                }
              }}
            >
              {error
                ? "Validation Failed. Retry?"
                : "Success Continue to dashboard?"}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Scan;
