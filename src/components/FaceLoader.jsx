import "./FaceLoader.css";
import { LuScanFace } from "react-icons/lu";

const FaceLoader = ({ error, stage }) => {
  return (
    <div className="flex  justify-center ">
      <div className=" z-50 text-2xl flex  justify-center items-center absolute">
        <LuScanFace
          className={`${
            !error && stage !== 4 ? "animate-ping" : "animate-none"
          } text-white text-6xl -top-6 relative`}
        />
      </div>
      <div className="container w-52 h-52 ">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default FaceLoader;
