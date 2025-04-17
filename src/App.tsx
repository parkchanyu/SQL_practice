import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import TableAddPage from './pages/TableAddPage';
import QueryPracticePage from './pages/QueryPracticePage';
import SqlQuizPage from './pages/SqlQuizPage';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="App">
      <header className="App-header">
        <h1>SQL Practice</h1>
      </header>
      <main className="App-main">
        <div className="options-container">
          <div className="option-card">
            <h2>테이블 추가</h2>
            <p>새로운 테이블을 생성하고 구조를 정의합니다.</p>
            <button className="option-button" onClick={() => navigate('/table-add')}>
              테이블 추가
            </button>
          </div>
          <div className="option-card">
            <h2>SQL 쿼리 연습</h2>
            <p>SQL 쿼리를 작성하고 실행해봅니다.</p>
            <button className="option-button" onClick={() => navigate('/query-practice')}>
              SQL 쿼리 연습
            </button>
          </div>
          <div className="option-card">
            <h2>SQL 퀴즈</h2>
            <p>간단한 SQL 퀴즈를 풀어봅니다.</p>
            <button className="option-button" onClick={() => navigate('/sql-quiz')}>
              SQL 퀴즈
            </button>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>Present by</p>
        <img src="/NEXUS2.png" alt="Nexus Logo" className="nexus-logo" />
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/table-add" element={<TableAddPage />} />
        <Route path="/query-practice" element={<QueryPracticePage />} />
        <Route path="/sql-quiz" element={<SqlQuizPage />} />
      </Routes>
    </Router>
  );
}

export default App;
