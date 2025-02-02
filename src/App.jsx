import React, { useState } from "react";
import CalculatorForm from "./components/CalculatorForm";
import Result from "./components/Result";
import Box from "./components/Box";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './App.css';

function App() {
  const [estimate, setEstimate] = useState(0);
  const [width, setWidth] = useState(0);
  const [depth, setDepth] = useState(0);
  const [height, setHeight] = useState(0);
  const [materialType, setMaterialType] = useState("");
  const [materialSize, setMaterialSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [coating, setCoating] = useState("X");
  const [bonding, setBonding] = useState("0");
  const [printColor, setPrintColor] = useState("1");
  const [productionQuantity, setProductionQuantity] = useState(0);
  const [testPrint, setTestPrint] = useState("X");

  return (
    <div className="app-container">
      <div className="left-section">
        <CalculatorForm
          setEstimate={setEstimate}
          setWidth={setWidth}
          setDepth={setDepth}
          setHeight={setHeight}
          setMaterialType={setMaterialType}
          setMaterialSize={setMaterialSize}
          setQuantity={setQuantity}
          setCoating={setCoating}
          setBonding={setBonding}
          setPrintColor={setPrintColor}
          setProductionQuantity={setProductionQuantity}
          setTestPrint={setTestPrint}
        />
      </div>
      <div className="right-section">
        <div className="box-model-section">
      <Canvas 
            camera={{ position: [0, 0, 5] }} 
            style={{ width: '100%', height: '100%' }}
            shadows
          >
            {/* 주변광 */}
            <ambientLight intensity={0.5} />
            
            {/* 메인 조명 */}
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.8}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            
            {/* 부드러운 채움광 */}
            <pointLight position={[-5, -5, -5]} intensity={0.2} />
            
            {/* 박스 컴포넌트 */}
            <Box 
              dimensions={{ width, depth, height }} 
              materialType={materialType} 
            />
            
            {/* 카메라 컨트롤 */}
            <OrbitControls 
              enableZoom={true}
              enablePan={true}
              minDistance={2}
              maxDistance={10}
            />
          </Canvas>
        </div>
        <div className="result-section">
          <Result
            materialType={materialType}
            materialSize={materialSize}
            quantity={quantity}
            coating={coating}
            bonding={bonding}
            printColor={printColor}
            productionQuantity={productionQuantity}
            testPrint={testPrint}
          />
        </div>
      </div>
    </div>
  );
}

export default App;