import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

const ImageEditor = ({ onImageChange, imageData }) => {
  const inputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange({
          url: event.target.result,
          rotation: 0,
          scale: 1,
          position: { x: 0, y: 0 },
          panel: 'front'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotationChange = (e) => {
    const newRotation = parseInt(e.target.value);
    if (imageData) {
      onImageChange({
        ...imageData,
        rotation: newRotation
      });
    }
  };

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    if (imageData) {
      onImageChange({
        ...imageData,
        scale: newScale
      });
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-4">
      <div className="space-y-4">
        <button
          onClick={() => inputRef.current.click()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          이미지 업로드
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {imageData && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1">회전 ({imageData.rotation}°)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={imageData.rotation}
                onChange={handleRotationChange}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">크기 ({imageData.scale}x)</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={imageData.scale}
                onChange={handleScaleChange}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BoxBlueprint = ({ width, height, depth, imageData, onImageMove }) => {
  const svgRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPanel = useRef(null);

  const maxSize = Math.max(width, height * 3 + depth * 2);
  const scale = Math.min(1, 500 / maxSize);
  
  const w = width * scale;
  const h = height * scale;
  const d = depth * scale;
  
  const totalWidth = w + (d * 2) + 80;
  const totalHeight = h * 3 + (d * 2) + 80;

  const startX = 40;
  const startY = 40;
  const baseX = startX + d;
  const baseY = startY + d;

  // 각 패널의 위치와 크기 정의
  const panels = {
    front: { x: baseX, y: baseY, width: w, height: h },
    back: { x: baseX, y: baseY + h + d, width: w, height: h },
    left: { x: startX, y: baseY, width: d, height: h },
    right: { x: baseX + w, y: baseY, width: d, height: h },
    top: { x: baseX, y: startY, width: w, height: d },
    bottom: { x: baseX, y: baseY + h, width: w, height: d }
  };

  // 특정 좌표가 어느 패널 안에 있는지 확인하는 함수
  const getPanelAtPosition = (x, y) => {
    return Object.entries(panels).find(([_, panel]) => {
      return x >= panel.x && 
             x <= panel.x + panel.width && 
             y >= panel.y && 
             y <= panel.y + panel.height;
    });
  };

  const handleMouseDown = (e) => {
    if (!imageData) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    // 현재 위치의 패널 확인
    const panelInfo = getPanelAtPosition(svgP.x, svgP.y);
    if (!panelInfo) return;

    const [panelName, panel] = panelInfo;
    currentPanel.current = { name: panelName, ...panel };
    
    isDragging.current = true;
    startPos.current = {
      x: svgP.x - (imageData.position?.x || 0),
      y: svgP.y - (imageData.position?.y || 0)
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !imageData || !currentPanel.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    // 현재 마우스 위치의 패널 확인
    const newPanelInfo = getPanelAtPosition(svgP.x, svgP.y);
    if (!newPanelInfo) return;

    const [newPanelName, newPanel] = newPanelInfo;
    
    // 패널 내에서의 상대 위치 계산
    const relativeX = svgP.x - newPanel.x;
    const relativeY = svgP.y - newPanel.y;

    onImageMove({
      x: relativeX,
      y: relativeY,
      panel: newPanelName
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    currentPanel.current = null;
  };

  return (
    <div className="w-full h-full bg-white">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full h-full"
        style={{ backgroundColor: 'white' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 각 패널에 대한 클리핑 패스 정의 */}
        <defs>
          {Object.entries(panels).map(([key, panel]) => (
            <clipPath key={key} id={`boxClip-${key}`}>
              <rect x={panel.x} y={panel.y} width={panel.width} height={panel.height} />
            </clipPath>
          ))}
        </defs>

        {/* 이미지 렌더링 */}
        {imageData?.url && imageData.panel && (
          <g clipPath={`url(#boxClip-${imageData.panel})`}>
            <image
              href={imageData.url}
              x={panels[imageData.panel].x + imageData.position.x}
              y={panels[imageData.panel].y + imageData.position.y}
              width={panels[imageData.panel].width}
              height={panels[imageData.panel].height}
              transform={`
                rotate(${imageData.rotation || 0} 
                  ${panels[imageData.panel].x + panels[imageData.panel].width/2} 
                  ${panels[imageData.panel].y + panels[imageData.panel].height/2})
                scale(${imageData.scale || 1})
              `}
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        )}

        {/* 박스 외곽선 */}
        <rect x={baseX} y={baseY} width={w} height={h} fill="none" stroke="black" strokeWidth="1" />
        <rect x={baseX} y={startY} width={w} height={d} fill="none" stroke="black" strokeWidth="1" />
        <rect x={baseX} y={baseY + h} width={w} height={d} fill="none" stroke="black" strokeWidth="1" />
        <rect x={startX} y={baseY} width={d} height={h} fill="none" stroke="black" strokeWidth="1" />
        <rect x={baseX + w} y={baseY} width={d} height={h} fill="none" stroke="black" strokeWidth="1" />
        <rect x={baseX} y={baseY + h + d} width={w} height={h} fill="none" stroke="black" strokeWidth="1" />

        {/* 접는 선 */}
        <g stroke="black" strokeDasharray="5,5" strokeWidth="0.5">
          <line x1={baseX} y1={startY} x2={baseX} y2={baseY + h + d * 2} />
          <line x1={baseX + w} y1={startY} x2={baseX + w} y2={baseY + h + d * 2} />
          <line x1={startX} y1={baseY} x2={baseX + w + d} y2={baseY} />
          <line x1={startX} y1={baseY + h} x2={baseX + w + d} y2={baseY + h} />
          <line x1={baseX} y1={baseY + h + d} x2={baseX + w} y2={baseY + h + d} />
        </g>
      </svg>
    </div>
  );
};

const BoxModel = ({ dimensions, material, imageData }) => {
  const { width, height, depth } = dimensions;
  const [textures, setTextures] = useState({});
  
  const w = Math.max(0.1, width / 100);
  const h = Math.max(0.1, height / 100);
  const d = Math.max(0.1, depth / 100);

  useEffect(() => {
    if (imageData?.url) {
      const loader = new THREE.TextureLoader();
      loader.load(imageData.url, (loadedTexture) => {
        // 텍스처 설정
        const newTexture = loadedTexture.clone();
        newTexture.wrapS = THREE.ClampToEdgeWrapping;
        newTexture.wrapT = THREE.ClampToEdgeWrapping;
        newTexture.center.set(0.5, 0.5);
        newTexture.rotation = (imageData.rotation || 0) * Math.PI / 180;
        newTexture.repeat.set(imageData.scale || 1, imageData.scale || 1);

        if (imageData.position) {
          let offsetX = (imageData.position.x / (imageData.panel === 'left' || imageData.panel === 'right' ? depth : width));
          let offsetY = (-imageData.position.y / (imageData.panel === 'top' || imageData.panel === 'bottom' ? depth : height));
          newTexture.offset.set(offsetX, offsetY);
        }

        newTexture.needsUpdate = true;
        setTextures({ ...textures, [imageData.panel || 'front']: newTexture });
      });
    }
  }, [imageData, width, height, depth]);

  const createMaterial = (face) => {
    return new THREE.MeshStandardMaterial({
      map: textures[face],
      color: material === 'KRAFT' ? '#D4B492' : material === 'BLACK' ? '#2D2D2D' : '#FFFFFF',
      roughness: 0.7,
      metalness: 0.1,
    });
  };

  return (
    <group>
      {/* 앞면 */}
      <mesh position={[0, 0, d/2]}>
        <planeGeometry args={[w, h]} />
        <primitive object={createMaterial('front')} />
      </mesh>

      {/* 뒷면 */}
      <mesh position={[0, 0, -d/2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <primitive object={createMaterial('back')} />
      </mesh>

      {/* 왼쪽 */}
      <mesh position={[-w/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[d, h]} />
        <primitive object={createMaterial('left')} />
      </mesh>

      {/* 오른쪽 */}
      <mesh position={[w/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[d, h]} />
        <primitive object={createMaterial('right')} />
      </mesh>

      {/* 위 */}
      <mesh position={[0, h/2, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={createMaterial('top')} />
      </mesh>

      {/* 아래 */}
      <mesh position={[0, -h/2, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={createMaterial('bottom')} />
      </mesh>
    </group>
  );
};

const CardboardBoxPreview = ({ dimensions, materialType }) => {
  const [imageData, setImageData] = useState(null);

  const handleImageMove = (movement) => {
    if (imageData) {
      setImageData({
        ...imageData,
        position: { x: movement.x, y: movement.y },
        panel: movement.panel
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <ImageEditor onImageChange={setImageData} imageData={imageData} />
      <div className="flex justify-between gap-4">
        <div className="w-1/2 h-96">
          <h3 className="text-lg font-semibold mb-2">도면</h3>
          <BoxBlueprint {...dimensions} imageData={imageData} onImageMove={handleImageMove} />
        </div>
        <div className="w-1/2 h-96">
          <h3 className="text-lg font-semibold mb-2">3D 모델</h3>
          <div className="w-full h-full bg-gray-100 rounded-lg">
            <Canvas camera={{ position: [2, 2, 2], fov: 50 }} shadows>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
              <BoxModel 
                dimensions={dimensions} 
                material={materialType} 
                imageData={imageData} 
              />
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

export default CardboardBoxPreview;