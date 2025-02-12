import React from 'react';
import PropTypes from 'prop-types';
import './Result.css';

// 가격 테이블 데이터
const PRICE_TABLE = [
  { size: "46전지", material: "KRAFT", price: 460000 },    // 크라프트 KLB337g
  { size: "46전지", material: "BLACK", price: 550000 },    // 흑지350g
  { size: "46전지", material: "WHITE", price: 300000 },    // ab라이트270g
  { size: "하드롱", material: "WHITE", price: 370000 },    // ab라이트270g
  { size: "국전지", material: "WHITE", price: 210000 }     // ab라이트270g
];

function Result({ 
  materialType,
  materialSize,
  quantity,
  coating,
  bonding,
  printColor,
  productionQuantity,
  testPrint,
  materialCount
}) {
  // INDEX/MATCH 함수 구현
  const calculatePrice = (materialType, materialSize) => {
    try {
      const matchingRow = PRICE_TABLE.find(
        row => row.material === materialType && row.size === materialSize
      );
      return matchingRow ? matchingRow.price : "값이없음";
    } catch (error) {
      return "값이없음";
    }
  };
  
  // 원단비 계산
  const calculateMaterialCost = () => {
    if (materialType === "값이 없음" || !materialType) return 0;
    
    const basePrice = calculatePrice(materialType, materialSize);
    if (basePrice === "값이없음" || typeof basePrice !== 'number') return 0;

    // quantity와 materialCount를 명시적으로 숫자로 변환
    const validQuantity = Number(quantity) || 0;
    const validMaterialCount = Number(materialCount) || 0;

    console.log('Material Cost Calculation:', {
      basePrice,
      validQuantity,
      validMaterialCount
    });

    // 연수와 판수를 고려한 가격 계산
    const cost = basePrice * validMaterialCount;// * validQuantity;
    return isNaN(cost) ? 0 : cost;
  };

  // 인쇄비 계산
  const calculatePrintCost = () => {
    if (materialType === "값이 없음") return 0;
    if (["1", "2"].includes(printColor)) return 60000;
    if (["3", "4"].includes(printColor)) return 80000;
    return 0;
  };

  // 코팅비 계산
  const calculateCoatingCost = () => {
    if (materialType === "값이 없음") return 0;
    return coating === "O" ? 70000 : 0;
  };

  // 톰슨비 계산
  const calculateThomsonCost = () => {
    if (materialType === "값이 없음") return 0;
    return testPrint === "O" ? 80000 : 50000;
  };

  // 접착비 계산
  const calculateBondingCost = () => {
    if (materialType === "값이 없음" || bonding === "0") return 0;
    if (bonding === "1") { // 단면
      return Math.max(productionQuantity * 10, 30000);
    }
    return Math.max(productionQuantity * 15, 45000); // 삼면
  };

  // 필름비 계산
  const calculateFilmCost = () => {
    if (materialType === "값이 없음") return 0;
    return Number(printColor) * 15000;
  };

  // 최종 견적 단가 계산
  const calculateFinalUnitPrice = () => {
    if (materialType === "값이 없음" || productionQuantity === 0) return 0;
    
    const materialCost = calculateMaterialCost();
    const printCost = calculatePrintCost();
    const coatingCost = calculateCoatingCost();
    const thomsonCost = calculateThomsonCost();
    const bondingCost = calculateBondingCost();
    const filmCost = calculateFilmCost();

    console.log('Final Cost Components:', {
      materialCost,
      printCost,
      coatingCost,
      thomsonCost,
      bondingCost,
      filmCost,
      productionQuantity
    });

    if (productionQuantity > 0) {
      const unitPrice = (
        ((materialCost + coatingCost + thomsonCost) / productionQuantity) +
        (bondingCost / productionQuantity) +
        (printCost / productionQuantity) +
        (filmCost / productionQuantity)
      ) * 1.4;

      return Math.round(unitPrice);
    }
    return 0;
  };

  return (
    <div className="result-container">
      <h2>견적 결과</h2>
      <div className="cost-breakdown">
        <div className="cost-item">
          <span>원단비:</span>
          <span>{calculateMaterialCost().toLocaleString()}원</span>
        </div>
        <div className="cost-item">
          <span>인쇄비:</span>
          <span>{calculatePrintCost().toLocaleString()}원</span>
        </div>
        <div className="cost-item">
          <span>코팅비:</span>
          <span>{calculateCoatingCost().toLocaleString()}원</span>
        </div>
        <div className="cost-item">
          <span>톰슨비:</span>
          <span>{calculateThomsonCost().toLocaleString()}원</span>
        </div>
        <div className="cost-item">
          <span>접착비:</span>
          <span>{calculateBondingCost().toLocaleString()}원</span>
        </div>
        <div className="cost-item">
          <span>필름비:</span>
          <span>{calculateFilmCost().toLocaleString()}원</span>
        </div>
        <div className="final-price">
          <span>최종 견적 단가:</span>
          <span>{calculateFinalUnitPrice().toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}

Result.propTypes = {
  materialType: PropTypes.string.isRequired,
  materialSize: PropTypes.string.isRequired,
  quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  coating: PropTypes.string.isRequired,
  bonding: PropTypes.string.isRequired,
  printColor: PropTypes.string.isRequired,
  productionQuantity: PropTypes.number.isRequired,
  testPrint: PropTypes.string.isRequired,
  materialCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};

export default Result;