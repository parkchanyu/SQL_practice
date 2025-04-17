import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <h2>SQL 연습</h2>
      <div className="options-container">
        <div className="option-card">
          <h2>데이터베이스 추가</h2>
          <p>새로운 데이터베이스를 추가하고 테이블을 생성하세요.</p>
          <button className="option-button" onClick={() => navigate('/database')}>
            시작하기
          </button>
        </div>
        <div className="option-card">
          <h2>SQL 쿼리 연습</h2>
          <p>SQL 쿼리를 작성하고 실행 결과를 확인하세요.</p>
          <button className="option-button" onClick={() => navigate('/query-practice')}>
            시작하기
          </button>
        </div>
        <div className="option-card">
          <h2>SQL 퀴즈</h2>
          <p>SQL 지식을 테스트하고 실력을 향상시키세요.</p>
          <button className="option-button" onClick={() => navigate('/sql-quiz')}>
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage; 