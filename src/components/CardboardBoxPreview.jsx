import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PropTypes from 'prop-types';

// 박스 도면 컴포넌트
const BoxBlueprint = ({ width, height, depth }) => {
  // 도면 스케일 계산
  const scale = 0.3;
  const w = width * scale;
  const h = height * scale;
  const d = depth * scale;
  
  // 여백 계산 (톰슨칼 자국용)
  const margin = Math.min(w, h, d) * 0.1;
  const flapHeight = d * 0.8;
  
  // 전체 도면 크기 계산
  const totalWidth = w + (d * 2) + (margin * 4);
  const totalHeight = h + (d * 2) + (margin * 4);

  // 톰슨칼 자국 패턴 생성
  const createThompsonCut = (x1, y1, x2, y2) => {
    const length = 5; // 자국 길이
    const gap = 3; // 자국 간격
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const count = Math.floor(distance / (length + gap));
    let pattern = '';

    for (let i = 0; i < count; i++) {
      const startPercent = i * (length + gap) / distance;
      const endPercent = (i * (length + gap) + length) / distance;
      const startX = x1 + dx * startPercent;
      const startY = y1 + dy * startPercent;
      const endX = x1 + dx * endPercent;
      const endY = y1 + dy * endPercent;
      pattern += `M ${startX} ${startY} L ${endX} ${endY} `;
    }

    return pattern;
  };

  return (
    <div className="w-full h-full bg-white">
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full h-full"
        style={{ backgroundColor: 'white' }}
      >
        <defs>
          <pattern id="foldLine" patternUnits="userSpaceOnUse" width="8" height="1">
            <line x1="0" y1="0" x2="4" y2="0" stroke="#6B7280" strokeWidth="0.5" />
          </pattern>
        </defs>
        
        {/* 메인 박스 본체 */}
        <g transform={`translate(${margin + d}, ${margin + d})`}>
          {/* 중앙 패널 */}
          <rect x="0" y="0" width={w} height={h} fill="none" stroke="#FF69B4" strokeWidth="1" />
          
          {/* 왼쪽 패널 */}
          <path
            d={`M 0 0 
                h -${d} 
                v ${h} 
                h ${d}`}
            fill="none" 
            stroke="#FF69B4" 
            strokeWidth="1"
          />
          
          {/* 오른쪽 패널 */}
          <path
            d={`M ${w} 0 
                h ${d} 
                v ${h} 
                h -${d}`}
            fill="none" 
            stroke="#FF69B4" 
            strokeWidth="1"
          />
          
          {/* 상단 플랩 */}
          <path
            d={`M 0 -${d} 
                h ${w} 
                l ${flapHeight} -${flapHeight} 
                h -${w + 2 * flapHeight} 
                l ${flapHeight} ${flapHeight}`}
            fill="none"
            stroke="#FF69B4"
            strokeWidth="1"
          />
          
          {/* 하단 플랩 */}
          <path
            d={`M 0 ${h} 
                h ${w} 
                l ${flapHeight} ${flapHeight} 
                h -${w + 2 * flapHeight} 
                l ${flapHeight} -${flapHeight}`}
            fill="none"
            stroke="#FF69B4"
            strokeWidth="1"
          />
          
          {/* 접힘선 */}
          <line x1="0" y1="0" x2="0" y2={h} stroke="url(#foldLine)" />
          <line x1={w} y1="0" x2={w} y2={h} stroke="url(#foldLine)" />
          <line x1="0" y1="0" x2={w} y2="0" stroke="url(#foldLine)" />
          <line x1="0" y1={h} x2={w} y2={h} stroke="url(#foldLine)" />
          
          {/* 톰슨칼 자국 */}
          <path
            d={createThompsonCut(-d, 0, -d, h)}
            stroke="#FF69B4"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d={createThompsonCut(w + d, 0, w + d, h)}
            stroke="#FF69B4"
            strokeWidth="0.5"
            fill="none"
          />
          
          {/* 치수 텍스트 */}
          <text x={w/2} y={h/2} fill="#4B5563" fontSize={Math.min(w, h) * 0.1}>
            앞면
          </text>
          <text x={w/2} y={-d/2} fill="#4B5563" fontSize={Math.min(w, h) * 0.1}>
            윗면
          </text>
          <text x={w/2} y={h + d/2} fill="#4B5563" fontSize={Math.min(w, h) * 0.1}>
            아랫면
          </text>
        </g>
      </svg>
    </div>
  );
};

// 3D 박스 모델 컴포넌트
const BoxModel = ({ dimensions, material }) => {
  const mesh = useRef();

  return (
    <group ref={mesh}>
      {/* 메인 박스 본체 */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry 
          args={[
            Math.max(0.1, dimensions.width / 100),
            Math.max(0.1, dimensions.height / 100),
            Math.max(0.1, dimensions.depth / 100)
          ]} 
        />
        <meshStandardMaterial 
          color={material === 'KRAFT' ? '#D4B492' : material === 'BLACK' ? '#2D2D2D' : '#FFFFFF'}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* 플랩 표현 */}
      <mesh position={[0, dimensions.height/200, 0]}>
        <boxGeometry 
          args={[
            Math.max(0.05, dimensions.width / 100),
            0.01,
            Math.max(0.05, dimensions.depth / 100)
          ]} 
        />
        <meshStandardMaterial 
          color={material === 'KRAFT' ? '#C4A482' : material === 'BLACK' ? '#1D1D1D' : '#F0F0F0'}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
};

// 메인 프리뷰 컴포넌트
const CardboardBoxPreview = ({ dimensions, materialType }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between gap-4">
        <div className="w-1/2 h-96">
          <h3 className="text-lg font-semibold mb-2">도면</h3>
          <BoxBlueprint {...dimensions} />
        </div>
        <div className="w-1/2 h-96">
          <h3 className="text-lg font-semibold mb-2">3D 모델</h3>
          <div className="w-full h-full bg-gray-100 rounded-lg">
            <Canvas
              camera={{ position: [1, 1, 1], fov: 60 }}
              shadows
            >
              <ambientLight intensity={0.6} />
              <directionalLight 
                position={[5, 5, 5]} 
                intensity={0.8} 
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <BoxModel dimensions={dimensions} material={materialType} />
              <OrbitControls 
                enableZoom={true}
                enablePan={true}
                minDistance={1}
                maxDistance={10}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

CardboardBoxPreview.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    depth: PropTypes.number.isRequired,
  }).isRequired,
  materialType: PropTypes.string.isRequired,
};

export default CardboardBoxPreview;