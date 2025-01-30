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
  testPrint
}) {
  // INDEX/MATCH 함수 구현
  const calculatePrice = (materialType, materialSize) => {
    console.log('calculatePrice inputs:', { materialType, materialSize });
    console.log('PRICE_TABLE:', PRICE_TABLE);
    
    try {
      const matchingRow = PRICE_TABLE.find(
        row => {
          console.log('Comparing:', {
            tableSize: row.size,
            tableMaterial: row.material,
            inputSize: materialSize,
            inputMaterial: materialType,
            isMatch: row.material === materialType && row.size === materialSize
          });
          return row.material === materialType && row.size === materialSize;
        }
      );
      return matchingRow ? matchingRow.price : "값이없음";
    } catch (error) {
      return "값이없음";
    }
  };
  
  // 원단비 계산도 로깅 추가
  const calculateMaterialCost = () => {
    console.log('calculateMaterialCost inputs:', {
      materialType,
      materialSize,
      quantity
    });
    
    if (materialType === "값이 없음") return 0;
    const basePrice = calculatePrice(materialType, materialSize);
    console.log('basePrice:', basePrice);
    
    if (basePrice === "값이없음") return 0;
    const cost = basePrice * quantity;
    console.log('final cost:', cost);
    return cost;
  };

  // 인쇄비 계산 (=IF(F7="값이 없음","0",IF(OR(G7=1,G7=2),"60,000",IF(OR(G7=3,G7=4),"80,000","0"))))
  const calculatePrintCost = () => {
    if (materialType === "값이 없음") return 0;
    if (["1", "2"].includes(printColor)) return 60000;
    if (["3", "4"].includes(printColor)) return 80000;
    return 0;
  };

  // 코팅비 계산 (=IF(F7="값이 없음","0",IF(H4="O","70,000","0")))
  const calculateCoatingCost = () => {
    if (materialType === "값이 없음") return 0;
    return coating === "O" ? 70000 : 0;
  };

  // 톰슨비 계산 (=IF(F7="값이 없음","0",IF(H7="O","80,000","50,000")))
  const calculateThomsonCost = () => {
    if (materialType === "값이 없음") return 0;
    return testPrint === "O" ? 80000 : 50000;
  };

  // 접착비 계산 (=IF(OR(F7="값이 없음",G4="없음"),"0",IF(G4="단면",MAX(F4*10,30000),MAX(F4*15,45000))))
  const calculateBondingCost = () => {
    if (materialType === "값이 없음" || bonding === "0") return 0;
    if (bonding === "1") { // 단면
      return Math.max(productionQuantity * 10, 30000);
    }
    return Math.max(productionQuantity * 15, 45000); // 삼면
  };

  // 필름비 계산 (=IF(F7="값이 없음","0",G7*15000))
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

  // =IF(F7="값이 없음","0",((D9+D11+D12)/F4)+(D13/F4)+(D10/F4)+(D14/F4))*1.4)
  if (productionQuantity > 0) {
    const unitPrice = (
      ((materialCost + coatingCost + thomsonCost) / productionQuantity) +  // (D9+D11+D12)/F4
      (bondingCost / productionQuantity) +                                 // D13/F4
      (printCost / productionQuantity) +                                   // D10/F4
      (filmCost / productionQuantity)                                      // D14/F4
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
  quantity: PropTypes.number.isRequired,
  coating: PropTypes.string.isRequired,
  bonding: PropTypes.string.isRequired,
  printColor: PropTypes.string.isRequired,
  productionQuantity: PropTypes.number.isRequired,
  testPrint: PropTypes.string.isRequired
};

export default Result;