import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:31495';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
}

const TableAddPage: React.FC = () => {
  const navigate = useNavigate();
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<Column[]>([
    { name: '', type: 'VARCHAR(255)', nullable: true, primary: false }
  ]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/databases/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tableName,
          columns: columns,
        }),
      });
      if (response.ok) {
        alert('테이블이 생성되었습니다');
        navigate('/');
      }
    } catch (error) {
      console.error('테이블 생성 실패:', error);
      alert('테이블 생성에 실패했습니다');
    }
  };

  return (
    <div className="table-add-page">
      <div className="page-header">
        <button className="back-button" onClick={handleBack}>
          ← 뒤로 가기
        </button>
        <h2>테이블 추가</h2>
      </div>
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
        <button type="submit" className="submit-button">테이블 생성</button>
      </form>
    </div>
  );
};

export default TableAddPage; 