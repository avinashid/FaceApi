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
    <motion.div
      className="flex flex-col self-end relative top-8  gap-4 items-center    h-full"
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <FaceLoader error={error} stage={stage} />
      <AnimatePresence>
        <motion.div
          className="flex flex-col gap-4 relative -top-20  "
          initial={{ color: "white" }}
          animate={{ color: !error ? "white" : "red" }}
        >
          {stage >= 1 && (
            <motion.div
              className="flex flex-row items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`rounded-full w-2 h-2 bg-white ${
                  stage == 1 && "animate-ping"
                }`}
              ></div>
              Detecting face...
            </motion.div>
          )}
          {stage >= 2 && (
            <motion.div
              className="flex flex-row items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`rounded-full w-2 h-2 bg-white ${
                  stage == 2 && "animate-ping"
                }`}
              ></div>
              Detecting posture...
            </motion.div>
          )}
          {stage >= 3 && (
            <motion.div
              className="flex flex-row items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`rounded-full w-2 h-2 bg-white ${
                  stage == 3 && "animate-ping"
                }`}
              ></div>
              Validating all...
            </motion.div>
          )}

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
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Scan;
