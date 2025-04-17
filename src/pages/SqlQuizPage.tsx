import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:31495';

interface Column {
  name: string;
  type: string;
}

interface Table {
  name: string;
  columns: Column[];
}

interface Question {
  id: string;
  question: string;
  answer: string;
  hint: string;
}

const SqlQuizPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tables`, { withCredentials: true });
      const tables = response.data;
      
      // 각 테이블의 구조 정보 가져오기
      const tablesWithStructure = await Promise.all(
        tables.map(async (table: any) => {
          const structureResponse = await axios.get(`${API_URL}/api/tables/${table.name}/structure`, { withCredentials: true });
          return {
            ...table,
            columns: structureResponse.data
          };
        })
      );
      
      setTables(tablesWithStructure);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const generateQuiz = async () => {
    if (tables.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/generate-quiz`, {
        tables: tables
      }, { withCredentials: true });
      setCurrentQuestion(response.data);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('퀴즈 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!userQuery) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/execute-query`, {
        query: userQuery
      }, { withCredentials: true });
      setQueryResult(response.data);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || '쿼리 실행에 실패했습니다.');
      setQueryResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="sql-quiz-page">
      {currentQuestion && (
        <>
          <div className="question-section">
            <h3>문제 {currentQuestion.id}</h3>
            <p>{currentQuestion.question}</p>
          </div>

          <div className="tables-section">
            <h4>사용 가능한 테이블:</h4>
            <div className="table-list">
              {tables.map(table => (
                <div key={table.name} className="table-info">
                  <h5>{table.name}</h5>
                  <div className="columns">
                    {table.columns.map(col => (
                      <div key={col.name} className="column">
                        {col.name} ({col.type})
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="workspace-section">
            <div className="query-section">
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="SQL 쿼리를 입력하세요..."
              />
              <div className="button-group">
                <button onClick={executeQuery}>실행</button>
                <button onClick={() => setUserQuery(currentQuestion.answer)}>정답 보기</button>
                <button onClick={() => alert(currentQuestion.hint)}>힌트 보기</button>
              </div>
            </div>

            <div className="result-section">
              <h4>실행 결과</h4>
              {queryResult && queryResult.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      {Object.keys(queryResult[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value: any, j) => (
                          <td key={j}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-result">실행 결과가 없습니다.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SqlQuizPage; 