import React, { useState, useRef, useEffect, useMemo } from 'react';
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
          position: { x: 0, y: 0 }
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

const BoxBlueprint = ({ width, height, depth, imageData, onImageMove, onUpdate }) => {
  const svgRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

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

  // 패널 정의
  const panels = useMemo(() => [
    {
      path: `M ${baseX},${baseY} h ${w} v ${h} h -${w} z`,
      id: 'front',
      label: '정면',
      centerX: baseX + w/2,
      centerY: baseY + h/2
    },
    {
      path: `M ${baseX},${baseY + h + d} h ${w} v ${h} h -${w} z`,
      id: 'back',
      label: '후면',
      centerX: baseX + w/2,
      centerY: baseY + h + d + h/2
    },
    {
      path: `M ${startX},${baseY} h ${d} v ${h} h -${d} z`,
      id: 'left',
      label: '좌',
      centerX: startX + d/2,
      centerY: baseY + h/2
    },
    {
      path: `M ${baseX + w},${baseY} h ${d} v ${h} h -${d} z`,
      id: 'right',
      label: '우',
      centerX: baseX + w + d/2,
      centerY: baseY + h/2
    },
    {
      path: `M ${baseX},${startY} h ${w} v ${d} h -${w} z`,
      id: 'top',
      label: '상',
      centerX: baseX + w/2,
      centerY: startY + d/2
    },
    {
      path: `M ${baseX},${baseY + h} h ${w} v ${d} h -${w} z`,
      id: 'bottom',
      label: '하',
      centerX: baseX + w/2,
      centerY: baseY + h + d/2
    }
  ], [baseX, baseY, w, h, d, startX, startY]);

  const captureBlueprint = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      onUpdate(canvas);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  useEffect(() => {
    captureBlueprint();
  }, [imageData, width, height, depth]);

  const handleMouseDown = (e) => {
    if (!imageData?.url) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    isDragging.current = true;
    startPos.current = {
      x: svgP.x - (imageData.position?.x || 0),
      y: svgP.y - (imageData.position?.y || 0)
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !imageData?.url) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    onImageMove({
      x: svgP.x - startPos.current.x,
      y: svgP.y - startPos.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
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
        <defs>
          {panels.map(panel => (
            <clipPath key={panel.id} id={`clip-${panel.id}`}>
              <path d={panel.path} />
            </clipPath>
          ))}
        </defs>

        {imageData?.url && (
          <g>
            {panels.map(panel => (
              <g key={panel.id} clipPath={`url(#clip-${panel.id})`}>
                <image
                  href={imageData.url}
                  x={imageData.position?.x || 0}
                  y={imageData.position?.y || 0}
                  width={totalWidth}
                  height={totalHeight}
                  transform={`
                    rotate(${imageData.rotation || 0} 
                      ${totalWidth / 2} 
                      ${totalHeight / 2}
                    ) 
                    scale(${imageData.scale || 1})
                  `}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            ))}
          </g>
        )}

        {panels.map(panel => (
          <path
            key={panel.id}
            d={panel.path}
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
        ))}

        <g stroke="black" strokeDasharray="5,5" strokeWidth="0.5">
          <line x1={baseX} y1={baseY} x2={baseX + w} y2={baseY} />
          <line x1={baseX} y1={baseY + h} x2={baseX + w} y2={baseY + h} />
          <line x1={baseX} y1={baseY} x2={baseX} y2={baseY + h} />
          <line x1={baseX + w} y1={baseY} x2={baseX + w} y2={baseY + h} />
          <line x1={baseX} y1={baseY + h + d} x2={baseX + w} y2={baseY + h + d} />
        </g>

        {panels.map(panel => (
          <text
            key={`label-${panel.id}`}
            x={panel.centerX}
            y={panel.centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="#666"
          >
            {panel.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const BoxModel = ({ dimensions, materialType, blueprintTexture }) => {
  const { width, height, depth } = dimensions;
  const [materials, setMaterials] = useState({});
  const materialsRef = useRef({});

  const w = Math.max(0.1, width / 100);
  const h = Math.max(0.1, height / 100);
  const d = Math.max(0.1, depth / 100);

  const getBaseColor = () => {
    switch (materialType) {
      case 'KRAFT':
        return '#D4B492';
      case 'BLACK':
        return '#2D2D2D';
      default:
        return '#FFFFFF';
    }
  };

  useEffect(() => {
    if (!blueprintTexture) return;

    const texture = new THREE.CanvasTexture(blueprintTexture);
    texture.needsUpdate = true;

    // 기본 재질 설정
    const newMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: getBaseColor(),
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    setMaterials({ main: newMaterial });

    return () => {
      texture.dispose();
      newMaterial.dispose();
    };
  }, [blueprintTexture, materialType]);

  return (
    <group>
      <mesh position={[0, 0, d/2]}>
        <planeGeometry args={[w, h]} />
        {materials.main && <primitive object={materials.main} attach="material" />}
      </mesh>

      <mesh position={[0, 0, -d/2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        {materials.main && <primitive object={materials.main} attach="material" />}
      </mesh>

      <mesh position={[-w/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[d, h]} />
        {materials.main && <primitive object={materials.main} attach="material" />}
      </mesh>

      <mesh position={[w/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[d, h]} />
        {materials.main && <primitive object={materials.main} attach="material" />}
      </mesh>

      <mesh position={[0, h/2, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        {materials.main && <primitive object={materials.main} attach="material" />}
      </mesh>

      <mesh position={[0, -h/2, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        {materials.main && <primitive object={materials.main} attach="material" />}
      </mesh>
    </group>
  );
};

const CardboardBoxPreview = ({ dimensions, materialType }) => {
  const [imageData, setImageData] = useState(null);
  const [blueprintTexture, setBlueprintTexture] = useState(null);

  const handleImageChange = (newImageData) => {
    setImageData({
      ...newImageData,
      position: { x: 0, y: 0 }
    });
  };

  const handleImageMove = (newPosition) => {
    if (imageData) {
      setImageData({
        ...imageData,
        position: newPosition
      });
    }
  };

  const handleBlueprintUpdate = (canvas) => {
    setBlueprintTexture(canvas);
  };

  return (
    <div className="w-full space-y-4">
      <ImageEditor onImageChange={handleImageChange} imageData={imageData} />
      <div className="flex justify-between gap-4">
        <div className="w-1/2 h-96">
          <h3 className="text-lg font-semibold mb-2">도면</h3>
          <BoxBlueprint 
            {...dimensions} 
            imageData={imageData}
            onImageMove={handleImageMove}
            onUpdate={handleBlueprintUpdate}
          />
        </div>
        <div className="w-1/2 h-96">
          <h3 className="text-lg font-semibold mb-2">3D 모델</h3>
          <div className="w-full h-full bg-gray-100 rounded-lg">
            <Canvas camera={{ position: [2, 2, 2], fov: 50 }} shadows>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
              <BoxModel 
                dimensions={dimensions} 
                materialType={materialType} 
                blueprintTexture={blueprintTexture}
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

CardboardBoxPreview.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    depth: PropTypes.number.isRequired,
  }).isRequired,
  materialType: PropTypes.oneOf(['WHITE', 'BLACK', 'KRAFT']).isRequired,
};

BoxBlueprint.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  depth: PropTypes.number.isRequired,
  imageData: PropTypes.shape({
    url: PropTypes.string,
    rotation: PropTypes.number,
    scale: PropTypes.number,
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  }),
  onImageMove: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

BoxModel.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    depth: PropTypes.number.isRequired,
  }).isRequired,
  materialType: PropTypes.string.isRequired,
  blueprintTexture: PropTypes.instanceOf(HTMLCanvasElement),
};

ImageEditor.propTypes = {
  onImageChange: PropTypes.func.isRequired,
  imageData: PropTypes.shape({
    url: PropTypes.string,
    rotation: PropTypes.number,
    scale: PropTypes.number,
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  }),
};

export default CardboardBoxPreview;