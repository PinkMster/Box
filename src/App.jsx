import React, { useState } from "react";
import CalculatorForm from "./components/CalculatorForm";
import Result from "./components/Result";
import CardboardBoxPreview from "./components/CardboardBoxPreview";
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
  const [materialCount, setMaterialCount] = useState(0.5);

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
          setMaterialCount={setMaterialCount}
        />

        <Result
            materialType={materialType}
            materialSize={materialSize}
            quantity={quantity}
            coating={coating}
            bonding={bonding}
            printColor={printColor}
            productionQuantity={productionQuantity}
            testPrint={testPrint}
            materialCount={materialCount}
          />
      </div>
      <div className="right-section">
        <CardboardBoxPreview 
          dimensions={{ width, height, depth }}
          materialType={materialType}
        />
      </div>
    </div>
  );
}

export default App;