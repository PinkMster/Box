import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './CalculatorForm.css';

function CalculatorForm({
  setEstimate,
  setWidth,
  setDepth,
  setHeight,
  setMaterialType,
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

  const handleChange = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputData.materialType) {
      alert("원단 종류를 선택해주세요.");
      return;
    }
    if (!inputData.materialSize) {
      alert("규격을 선택해주세요.");
      return;
    }
    try {
      const response = await axios.post("/api/calculate", inputData);
      setEstimate(response.data.estimate);

      setWidth(parseFloat(inputData.width));
      setDepth(parseFloat(inputData.depth));
      setHeight(parseFloat(inputData.height));
      setMaterialType(inputData.materialType);
    } catch (error) {
      console.error("Error calculating estimate:", error);
      console.error(
        "Error:",
        error.response || error.request || error.message
      );
    }
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
};

export default CalculatorForm;