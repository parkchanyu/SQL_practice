import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Table {
  Tables_in_sql_practice: string;
}

interface TableStructure {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

interface TableData {
  [key: string]: any[];
}

const QueryPracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [tableStructures, setTableStructures] = useState<Record<string, TableStructure[]>>({});
  const [tableData, setTableData] = useState<TableData>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('http://localhost:31495/api/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error('테이블 목록 조회 실패:', error);
    }
  };

  const fetchTableStructure = async (tableName: string) => {
    try {
      const response = await fetch(`http://localhost:31495/api/tables/${tableName}/structure`);
      if (response.ok) {
        const data = await response.json();
        setTableStructures(prev => ({
          ...prev,
          [tableName]: data
        }));
      }
    } catch (error) {
      console.error('테이블 구조 조회 실패:', error);
    }
  };

  const fetchTableData = async (tableName: string) => {
    try {
      const response = await fetch(`http://localhost:31495/api/tables/${tableName}/data`);
      if (response.ok) {
        const data = await response.json();
        setTableData(prev => ({
          ...prev,
          [tableName]: data
        }));
      }
    } catch (error) {
      console.error('테이블 데이터 조회 실패:', error);
    }
  };

  const handleTableSelect = async (tableName: string) => {
    if (selectedTables.includes(tableName)) {
      setSelectedTables(selectedTables.filter(name => name !== tableName));
      setTableData(prev => {
        const newData = { ...prev };
        delete newData[tableName];
        return newData;
      });
    } else if (selectedTables.length < 3) {
      setSelectedTables([...selectedTables, tableName]);
      await fetchTableData(tableName);
    }
  };

  const handleExecute = async () => {
    if (!query) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:31495/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const error = await response.json();
        alert(error.error || '쿼리 실행에 실패했습니다');
      }
    } catch (error) {
      console.error('쿼리 실행 실패:', error);
      alert('쿼리 실행에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="query-practice-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← 뒤로 가기
        </button>
        <h2>SQL 쿼리 연습</h2>
      </div>

      <div className="tables-section">
        <h3>사용 가능한 테이블</h3>
        <div className="tables-list">
          {tables.map((table) => (
            <div
              key={table.Tables_in_sql_practice}
              className={`table-item ${selectedTables.includes(table.Tables_in_sql_practice) ? 'selected' : ''}`}
              onClick={() => handleTableSelect(table.Tables_in_sql_practice)}
            >
              {table.Tables_in_sql_practice}
            </div>
          ))}
        </div>
        <div className="selected-tables">
          <h4>선택된 테이블 ({selectedTables.length}/3)</h4>
          <div className="selected-tables-list">
            {selectedTables.map((tableName) => (
              <div key={tableName} className="selected-table-item">
                {tableName}
                <button
                  className="remove-table-button"
                  onClick={() => handleTableSelect(tableName)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTables.length > 0 && (
        <div className="table-data-section">
          {selectedTables.map((tableName) => (
            <div key={tableName} className="table-data">
              <h3>{tableName} 테이블</h3>
              {tableData[tableName] && tableData[tableName].length > 0 ? (
                <table className="data">
                  <thead>
                    <tr>
                      {Object.keys(tableData[tableName][0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData[tableName].map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>데이터가 없습니다.</p>
              )}
              {tableStructures[tableName] && (
                <>
                  <h3>{tableName} 스키마</h3>
                  <table className="schema">
                    <thead>
                      <tr>
                        <th>필드</th>
                        <th>타입</th>
                        <th>Null</th>
                        <th>키</th>
                        <th>기본값</th>
                        <th>추가</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableStructures[tableName].map((field, index) => (
                        <tr key={index}>
                          <td>{field.Field}</td>
                          <td>{field.Type}</td>
                          <td>{field.Null}</td>
                          <td>{field.Key}</td>
                          <td>{field.Default}</td>
                          <td>{field.Extra}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="query-section">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SQL 쿼리를 입력하세요"
          rows={5}
        />
        <button
          className="execute-button"
          onClick={handleExecute}
          disabled={isLoading}
        >
          {isLoading ? '실행 중...' : '쿼리 실행'}
        </button>
      </div>

      {result.length > 0 && (
        <div className="result-section">
          <h3>실행 결과</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(result[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value: any, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QueryPracticePage; 