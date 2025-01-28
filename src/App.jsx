import React, { useState } from "react";
import CalculatorForm from "./components/CalculatorForm";
import Result from "./components/Result";

function App() {
  const [estimate, setEstimate] = useState(0);
  const [width, setWidth] = useState(0); // 가로 상태
  const [depth, setDepth] = useState(0); // 세로 상태
  const [height, setHeight] = useState(0); // 높이 상태
  const [materialType, setMaterialType] = useState(""); // 재질 상태

  return (
    <div className="App">
      <CalculatorForm
        setEstimate={setEstimate}
        setWidth={setWidth} // 가로 설정 함수 전달
        setDepth={setDepth} // 세로 설정 함수 전달
        setHeight={setHeight} // 높이 설정 함수 전달
        setMaterialType={setMaterialType} // 재질 설정 함수 전달
      />
      <Result
        estimate={estimate}
        width={width} // 가로 값 전달
        depth={depth} // 세로 값 전달
        height={height} // 높이 값 전달
        materialType={materialType} // 재질 값 전달
      />
    </div>
  );
}

export default App;