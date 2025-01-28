import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {} from "@react-three/fiber"
import Box from "./Box";
import PropTypes from "prop-types";

function Result({ estimate, width, depth, height, materialType }) {
  const scaledWidth = parseFloat(width) / 20;
  const scaledDepth = parseFloat(depth) / 20;
  const scaledHeight = parseFloat(height) / 20;

  const materialColors = {
    WHITE: "lightblue",
    BLACK: "black",
    KRAFT: "brown",
  };

  const color = materialColors[materialType] || "lightblue";

  return (
    <div>
      <h3>견적 결과:</h3>
      {estimate > 0 ? (
        <p>{estimate.toFixed(2)} 원</p>
      ) : (
        <p>견적을 계산해주세요.</p>
      )}

      {estimate > 0 && (
        <div style={{ width: "300px", height: "300px" }}>
          <Canvas
            camera={{ position: [1.5, 1.5, 2.5], fov: 55 }}
            style={{ width: "100%", height: "100%" }}
          >
             <ambientLight intensity = {1} />
            <Box
              dimensions={{
                width: scaledWidth,
                depth: scaledDepth,
                height: scaledHeight,
              }}
              color={color}
            />
            <OrbitControls />
          </Canvas>
        </div>
      )}
    </div>
  );
}

Result.propTypes = {
  estimate: PropTypes.number,
  width: PropTypes.number,
  depth: PropTypes.number,
  height: PropTypes.number,
  materialType: PropTypes.string,
};

export default Result;