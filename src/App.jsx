import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CalculatorForm from './CalculatorForm';
import Box from './Box'; // Box 컴포넌트 import

function App() {
  const [estimate, setEstimate] = useState(0);
  const [width, setWidth] = useState(4); // 초기값 설정
  const [depth, setDepth] = useState(4); // 초기값 설정
  const [height, setHeight] = useState(2); // 초기값 설정
  const [materialType, setMaterialType] = useState('');

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} castShadow />
          <Box
            dimensions={{ width, depth, height }}
            materialType={materialType}
            width={width}
            depth={depth}
            height={height}
          />
          <OrbitControls />
        </Canvas>
      </div>
      <div style={{ width: '50%', padding: '20px' }}>
        <CalculatorForm
          setEstimate={setEstimate}
          setWidth={setWidth}
          setDepth={setDepth}
          setHeight={setHeight}
          setMaterialType={setMaterialType}
        />
        <div>
          <h3>견적: {estimate}</h3>
        </div>
      </div>
    </div>
  );
}

export default App;