import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:31495';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
}

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

const TableAddPage: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableStructure, setTableStructure] = useState<TableStructure[]>([]);
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<Column[]>([
    { name: '', type: 'VARCHAR(255)', nullable: true, primary: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'insert'>('create');
  const [rowData, setRowData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/databases/tables`, { withCredentials: true });
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchTableStructure = async (tableName: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/databases/tables/${tableName}/structure`, { withCredentials: true });
      setTableStructure(response.data);
      const initialRowData: Record<string, string> = {};
      response.data.forEach((column: TableStructure) => {
        initialRowData[column.Field] = '';
      });
      setRowData(initialRowData);
    } catch (error) {
      console.error('Error fetching table structure:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'VARCHAR(255)', nullable: true, primary: false }]);
  };

  const handleColumnChange = (index: number, field: string, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;

    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(dragIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);
    setColumns(newColumns);
  }, [columns]);

  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName);
    await fetchTableStructure(tableName);
    setMode('insert');
  };

  const handleRowDataChange = (columnName: string, value: string) => {
    setRowData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'create') {
        const response = await axios.post(`${API_URL}/api/databases/tables`, {
          tableName,
          columns,
        }, { withCredentials: true });

        if (response.status === 201) {
          alert('테이블이 성공적으로 생성되었습니다.');
          navigate('/query-practice');
        }
      } else {
        const response = await axios.post(`${API_URL}/api/databases/tables/${selectedTable}/data`, {
          data: rowData
        }, { withCredentials: true });

        if (response.status === 201) {
          alert('데이터가 성공적으로 추가되었습니다.');
          setRowData(Object.fromEntries(Object.keys(rowData).map(key => [key, ''])));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || '작업에 실패했습니다.');
      } else {
        alert('작업에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="table-add-page">
      <div className="page-header">
        <button className="back-button" onClick={handleBack}>
          ← 뒤로 가기
        </button>
        <h2>{mode === 'create' ? '테이블 생성' : '데이터 추가'}</h2>
      </div>

      <div className="mode-selector">
        <button
          className={`mode-button ${mode === 'create' ? 'active' : ''}`}
          onClick={() => setMode('create')}
        >
          테이블 생성
        </button>
        <button
          className={`mode-button ${mode === 'insert' ? 'active' : ''}`}
          onClick={() => setMode('insert')}
        >
          데이터 추가
        </button>
      </div>

      {mode === 'create' ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>테이블 이름</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              required
            />
          </div>
          <div className="columns-container">
            <h3>컬럼 <small>(드래그하여 순서 변경)</small></h3>
            {columns.map((column, index) => (
              <div
                key={index}
                className="column-group"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="column-drag-handle">⋮⋮</div>
                <input
                  type="text"
                  placeholder="컬럼 이름"
                  value={column.name}
                  onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                  required
                />
                <select
                  value={column.type}
                  onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                >
                  <option value="VARCHAR(255)">VARCHAR(255)</option>
                  <option value="INT">INT</option>
                  <option value="DATE">DATE</option>
                  <option value="TEXT">TEXT</option>
                </select>
                <label>
                  <input
                    type="checkbox"
                    checked={column.nullable}
                    onChange={(e) => handleColumnChange(index, 'nullable', e.target.checked)}
                  />
                  NULL 허용
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={column.primary}
                    onChange={(e) => handleColumnChange(index, 'primary', e.target.checked)}
                  />
                  Primary Key
                </label>
                <button
                  type="button"
                  className="remove-column-button"
                  onClick={() => handleRemoveColumn(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddColumn} className="add-column-button">
              + 컬럼 추가
            </button>
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? '생성 중...' : '테이블 생성'}
          </button>
        </form>
      ) : (
        <div className="data-insert-section">
          <div className="tables-list">
            <h3>테이블 선택</h3>
            <div className="table-items">
              {tables.map((table) => (
                <div
                  key={table.Tables_in_sql_practice}
                  className={`table-item ${selectedTable === table.Tables_in_sql_practice ? 'selected' : ''}`}
                  onClick={() => handleTableSelect(table.Tables_in_sql_practice)}
                >
                  {table.Tables_in_sql_practice}
                </div>
              ))}
            </div>
          </div>

          {selectedTable && (
            <form onSubmit={handleSubmit} className="data-form">
              <h3>{selectedTable} 테이블에 데이터 추가</h3>
              <div className="data-fields">
                {tableStructure.map((column) => (
                  <div key={column.Field} className="form-group">
                    <label>{column.Field}</label>
                    <input
                      type={column.Type.includes('int') ? 'number' : 'text'}
                      value={rowData[column.Field]}
                      onChange={(e) => handleRowDataChange(column.Field, e.target.value)}
                      required={column.Null === 'NO'}
                      placeholder={`${column.Type}${column.Null === 'YES' ? ' (선택사항)' : ''}`}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? '추가 중...' : '데이터 추가'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default TableAddPage; 