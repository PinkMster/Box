import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CalculatorForm.css';

// 상수 정의
// 원단 종류별로 사용 가능한 규격 정의
const MATERIAL_TYPES = {
  "": "선택하세요",
  "WHITE": {
    label: "ab라이트270g",
    sizes: ["46전지", "하드롱", "국전지"]
  },
  "BLACK": {
    label: "흑지350g",
    sizes: ["46전지"]
  },
  "KRAFT": {
    label: "크라프트 KLB337g",
    sizes: ["46전지"]
  }
};

const BONDING_OPTIONS = {
  "0": "없음",
  "1": "단면",
  "3": "삼면"
};

const COATING_OPTIONS = {
  "O": "O",
  "X": "X"
};

const PRINT_COLOR_OPTIONS = {
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4"
};

const TEST_PRINT_OPTIONS = {
  "O": "O",
  "X": "X"
};

const MATERIAL_COUNT_OPTIONS = {
  "0.5": "0.5",
  "1": "1"
};

const MATERIAL_SIZES = {
  "46전지": [
    { width: 1091, height: 788 },
    { width: 788, height: 545 },
    { width: 778, height: 363 },
    { width: 545, height: 394 },
    { width: 697, height: 394 }
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

// 규격별 사용 가능한 절수 정의
const SIZE_CUT_COUNT_MAP = {
  "46전지": ["1", "2", "3", "T3", "4"],
  "하드롱": ["1", "2", "3", "4"],
  "국전지": ["1", "2"]
};

const cutCountMap = {
  "1": { index: 0, value: "1", label: "1" },
  "2": { index: 1, value: "2", label: "2" },
  "3": { index: 2, value: "3", label: "3" },
  "T3": { index: 4, value: "3", label: "T3" },
  "4": { index: 3, value: "4", label: "4" }
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
  setTestPrint,
  setMaterialCount
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

  const findMaterialSize = (materialSize, cutCount) => {
    if (!materialSize || !MATERIAL_SIZES[materialSize]) {
      return { width: 0, height: 0 };
    }
    
    const { index } = cutCountMap[cutCount] || { index: 0 };
    return MATERIAL_SIZES[materialSize][index] || MATERIAL_SIZES[materialSize][0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // cutCount 값 변환
    const actualValue = name === 'cutCount' ? 
      cutCountMap[value]?.value || value : 
      value;
    
    // 입력 데이터 업데이트
    setInputData(prev => ({ ...prev, [name]: value }));

    // 원단 크기 업데이트
    if (name === 'materialSize' || name === 'cutCount') {
      const newSize = findMaterialSize(
        name === 'materialSize' ? value : inputData.materialSize,
        name === 'cutCount' ? value : inputData.cutCount
      );
      setMaterialDimensions(newSize);
    }

    // 상태 업데이트
    switch (name) {
      case 'materialCount':
        setMaterialCount(Number(value));
        break;
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
        setMaterialSize(value);
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
    const currentCutCount = name === 'cutCount' ? value : inputData.cutCount;
    const currentQuantity = name === 'quantity' ? value : inputData.quantity;
    const currentMaterialCount = name === 'materialCount' ? value : inputData.materialCount;

    const cutCountValue = cutCountMap[currentCutCount]?.value || currentCutCount;
    const newProductionQuantity = 
      Number(currentQuantity) * 
      Number(cutCountValue) * 
      Number(currentMaterialCount) * 
      500;

    if (isFinite(newProductionQuantity)) {
      setProductionQuantity(newProductionQuantity);
    }

    calculateEstimate(name, actualValue);
  };

  // 원단비 계산
  const calculateMaterialCost = (data) => {
    if (!data.materialType || !data.materialSize) {
      return 0;
    }

    const basePrice = PRICE_TABLE[data.materialSize]?.[data.materialType] || 0;
    return basePrice * Number(data.materialCount) * Number(data.quantity);
  };

  // 인쇄비 계산
  const calculatePrintCost = (printColor) => {
    return PRINT_COLOR_PRICES[printColor] || 0;
  };

  // 코팅비 계산
  const calculateCoatingCost = (coating) => {
    return coating === "O" ? COATING_PRICE : 0;
  };

  // 톰슨비 계산
  const calculateThomsonCost = (testPrint) => {
    return THOMSON_PRICES[testPrint] || THOMSON_PRICES["X"];
  };

  // 접착비 계산
  const calculateBondingCost = (bonding, productionQuantity) => {
    if (bonding === "0" || !BONDING_PRICES[bonding]) {
      return 0;
    }

    const { unitPrice, minPrice } = BONDING_PRICES[bonding];
    const calculatedPrice = productionQuantity * unitPrice;
    return Math.max(calculatedPrice, minPrice);
  };

  // 필름비 계산
  const calculateFilmCost = (printColor) => {
    return Number(printColor) * FILM_PRICE_PER_COLOR;
  };

  const calculateEstimate = (changedName, changedValue) => {
    const currentData = {
      ...inputData,
      [changedName]: changedValue
    };

    if (!currentData.materialType || !currentData.materialSize) {
      return;
    }

    const cutCountValue = cutCountMap[currentData.cutCount]?.value || currentData.cutCount;
    const productionQuantity = 
      Number(currentData.quantity) * 
      Number(cutCountValue) * 
      Number(currentData.materialCount) * 
      500;

    if (productionQuantity > 0) {
      setProductionQuantity(productionQuantity);

      // 각 비용 계산
      const materialCost = calculateMaterialCost(currentData);
      const printCost = calculatePrintCost(currentData.printColor);
      const coatingCost = calculateCoatingCost(currentData.coating);
      const thomsonCost = calculateThomsonCost(currentData.testPrint);
      const bondingCost = calculateBondingCost(currentData.bonding, productionQuantity);
      const filmCost = calculateFilmCost(currentData.printColor);

      // 최종 견적 계산 (1.4배 마진 적용)
      const totalCost = 
        materialCost + printCost + coatingCost + thomsonCost + bondingCost + filmCost;
      const unitPrice = Math.round((totalCost / productionQuantity) * 1.4);

      setEstimate(unitPrice);
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
  
    const cutCountValue = cutCountMap[inputData.cutCount]?.value || inputData.cutCount;
    const productionQuantity = 
      Number(inputData.quantity) * 
      Number(cutCountValue) * 
      Number(inputData.materialCount) * 
      500;
  
    setProductionQuantity(productionQuantity);
  };

  const calculateProductionQuantity = () => {
    const currentCutCount = inputData.cutCount;
    const cutCountValue = cutCountMap[currentCutCount]?.value || currentCutCount;
    
    const result = Number(inputData.quantity) * 
      Number(cutCountValue) * 
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
            {Object.entries(BONDING_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
            {Object.entries(COATING_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
            <option value="">선택하세요</option>
            {Object.entries(MATERIAL_TYPES).filter(([key]) => key !== "").map(([value, data]) => (
              <option key={value} value={value}>{data.label}</option>
            ))}
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
            <option value="">선택하세요</option>
            {inputData.materialType && MATERIAL_TYPES[inputData.materialType]?.sizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
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
            {inputData.materialSize && SIZE_CUT_COUNT_MAP[inputData.materialSize]?.map((count) => (
              <option key={count} value={count}>{cutCountMap[count].label}</option>
            ))}
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
            {Object.entries(MATERIAL_COUNT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
            {Object.entries(PRINT_COLOR_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
            {Object.entries(TEST_PRINT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

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
  setTestPrint: PropTypes.func.isRequired,
  setMaterialCount: PropTypes.func.isRequired
};

export default CalculatorForm;