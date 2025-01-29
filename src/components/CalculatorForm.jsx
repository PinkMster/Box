import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './CalculatorForm.css';

const MATERIAL_SIZES = {
  "46전지": [
    { width: 1091, height: 788 },
    { width: 788, height: 545 },
    { width: 778, height: 363 },
    { width: 697, height: 394 },
    { width: 545, height: 394 }
  ],
  "국전지": [
    { width: 939, height: 636 },
    { width: 636, height: 469 }
  ],
  "하드롱": [
    { width: 1194, height: 889 },
    { width: 889, height: 597 },
    { width: 889, height: 398 },
    { width: 597, height: 444 }
  ]
};

function CalculatorForm({
  setEstimate,
  setWidth,
  setDepth,
  setHeight,
  setMaterialType,
  setMaterialSize,
  setQuantity,
  setCoating,
  setBonding,
  setPrintColor,
  setProductionQuantity,
  setTestPrint
}) {
  const [inputData, setInputData] = useState({
    width: 0,
    depth: 0,
    height: 0,
    quantity: 1,
    bonding: "0",
    coating: "X",
    materialType: "",
    materialSize: "",
    cutCount: "1",
    materialCount: 0.5,
    printColor: "1",
    testPrint: "X",
  });

  const [materialDimensions, setMaterialDimensions] = useState({ width: 0, height: 0 });

  const PRICE_TABLE = [
    { size: "46전지", material: "KRAFT", price: 460000 },
    { size: "46전지", material: "BLACK", price: 550000 },
    { size: "46전지", material: "WHITE", price: 300000 },
    { size: "하드롱", material: "WHITE", price: 370000 },
    { size: "국전지", material: "WHITE", price: 210000 }
  ];
  
  // calculateMaterialCost 함수 추가
  const calculateMaterialCost = (materialType, materialSize, quantity) => {
    if (materialType === "값이 없음") return 0;
    
    // 가격 찾기
    const matchingRow = PRICE_TABLE.find(
      row => row.material === materialType && row.size === materialSize
    );
    
    const basePrice = matchingRow ? matchingRow.price : "값이없음";
    if (basePrice === "값이없음") return 0;
    
    return basePrice * quantity;
  };

    // 원단 크기 찾기 함수
    const findMaterialSize = (materialSize) => {
      if (!materialSize || !MATERIAL_SIZES[materialSize]) {
        return { width: 0, height: 0 };
      }
      return MATERIAL_SIZES[materialSize][0]; // 첫 번째 크기 반환
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData(prev => ({ ...prev, [name]: value }));

    // 원단 크기 업데이트
    if (name === 'materialSize') {
      const newSize = findMaterialSize(value);
      setMaterialDimensions(newSize);
    }

    // 상위 컴포넌트 상태 업데이트
    switch (name) {
      case 'quantity':
        setQuantity(Number(value));
        break;
      case 'coating':
        setCoating(value);
        break;
      case 'bonding':
        setBonding(value);
        break;
      case 'printColor':
        setPrintColor(value);
        break;
      case 'testPrint':
        setTestPrint(value);
        break;
      case 'materialType':
        setMaterialType(value);
        break;
        case 'materialSize':
          setMaterialSize(value)
          const newSize = findMaterialSize(value);
          setMaterialDimensions(newSize);
          break;
      case 'width':
        setWidth(Number(value));
        break;
      case 'depth':
        setDepth(Number(value));
        break;
      case 'height':
        setHeight(Number(value));
        break;
    }

    // 제작수량 계산 및 업데이트
    if (['quantity', 'cutCount', 'materialCount'].includes(name)) {
      const newProductionQuantity = calculateProductionQuantity();
      setProductionQuantity(newProductionQuantity);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!inputData.materialType) {
      alert("원단 종류를 선택해주세요.");
      return;
    }
    if (!inputData.materialSize) {
      alert("규격을 선택해주세요.");
      return;
    }
  
    const productionQuantity = 
      Number(inputData.quantity) * 
      Number(inputData.cutCount) * 
      Number(inputData.materialCount) * 
      500;
  
    setProductionQuantity(productionQuantity);
    
    const materialCost = calculateMaterialCost(
      inputData.materialType,
      inputData.materialSize,
      inputData.quantity
    );
    
    const estimate = Math.round(
      ((materialCost) / productionQuantity) * 1.4
    );
  
    setEstimate(estimate);
  };

  const calculateProductionQuantity = () => {
    const result = Number(inputData.quantity) * 
           Number(inputData.cutCount) * 
           Number(inputData.materialCount) * 
           500;
    return isFinite(result) ? result : 0;
  };

  return (
    <form onSubmit={handleSubmit} className="calculator-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="width">가로(mm):</label>
          <input
            type="number"
            id="width"
            name="width"
            value={inputData.width}
            onChange={handleChange}
            placeholder="가로"
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="depth">폭(mm):</label>
          <input
            type="number"
            id="depth"
            name="depth"
            value={inputData.depth}
            onChange={handleChange}
            placeholder="폭"
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="height">높이(mm):</label>
          <input
            type="number"
            id="height"
            name="height"
            value={inputData.height}
            onChange={handleChange}
            placeholder="높이"
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">판수:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={inputData.quantity}
            onChange={handleChange}
            placeholder="판수"
            className="input-field"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="bonding">접착:</label>
          <select
            id="bonding"
            name="bonding"
            value={inputData.bonding}
            onChange={handleChange}
            className="select-field"
          >
            <option value="0">없음</option>
            <option value="1">단면</option>
            <option value="3">삼면</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="coating">코팅:</label>
          <select
            id="coating"
            name="coating"
            value={inputData.coating}
            onChange={handleChange}
            className="select-field"
          >
            <option value="O">O</option>
            <option value="X">X</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="materialType">원단 종류:</label>
          <select
            id="materialType"
            name="materialType"
            value={inputData.materialType}
            onChange={handleChange}
            className="select-field"
          >
            <option value="">값이 없음</option>
            <option value="WHITE">ab라이트270g</option>
            <option value="BLACK">흑지350g</option>
            <option value="KRAFT">크라프트 KLB337g</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="materialSize">규격:</label>
          <select
            id="materialSize"
            name="materialSize"
            value={inputData.materialSize}
            onChange={handleChange}
            className="select-field"
          >
            <option value="">값이 없음</option>
            <option value="46전지">46전지</option>
            <option value="하드롱">하드롱</option>
            <option value="국전지">국전지</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="cutCount">절수:</label>
          <select
            id="cutCount"
            name="cutCount"
            value={inputData.cutCount}
            onChange={handleChange}
            className="select-field"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="4">4</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="materialCount">연수:</label>
          <select
            id="materialCount"
            name="materialCount"
            value={inputData.materialCount}
            onChange={handleChange}
            className="select-field"
          >
            <option value="0.5">0.5</option>
            <option value="1">1</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="printColor">인쇄도수:</label>
          <select
            id="printColor"
            name="printColor"
            value={inputData.printColor}
            onChange={handleChange}
            className="select-field"
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="testPrint">시야기:</label>
          <select
            id="testPrint"
            name="testPrint"
            value={inputData.testPrint}
            onChange={handleChange}
            className="select-field"
          >
            <option value="O">O</option>
            <option value="X">X</option>
          </select>
        </div>
      </div>

      {/* 원단 크기 표시 */}{/* 제작수량 표시 */}
      <div className="form-row">
      <div className="form-group">
          <label>원단 크기:</label>
          <input
            type="text"
            value={materialDimensions.width && materialDimensions.height 
              ? `${materialDimensions.width} x ${materialDimensions.height}mm`
              : ''}
            readOnly
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>제작수량:</label>
          <input
            type="text"
            value={`${calculateProductionQuantity().toLocaleString()}매`}
            readOnly
            className="input-field"
          />
        </div>
      </div>

      <button type="submit" className="submit-button">
        견적 계산
      </button>
    </form>
  );
}

CalculatorForm.propTypes = {
  setEstimate: PropTypes.func.isRequired,
  setWidth: PropTypes.func.isRequired,
  setDepth: PropTypes.func.isRequired,
  setHeight: PropTypes.func.isRequired,
  setMaterialType: PropTypes.func.isRequired,
  setMaterialSize: PropTypes.func.isRequired,
  setQuantity: PropTypes.func.isRequired,
  setCoating: PropTypes.func.isRequired,
  setBonding: PropTypes.func.isRequired,
  setPrintColor: PropTypes.func.isRequired,
  setProductionQuantity: PropTypes.func.isRequired,
  setTestPrint: PropTypes.func.isRequired
};

export default CalculatorForm;