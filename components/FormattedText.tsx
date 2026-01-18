
import React from 'react';

interface Props {
  text: string;
}

export const FormattedText: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  // Process block by block
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentTable: string[] = [];

  const flushTable = (index: number) => {
    if (currentTable.length > 0) {
      elements.push(<TableBlock key={`table-${index}`} rows={currentTable} />);
      currentTable = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table detection
    if (trimmed.startsWith('|')) {
      currentTable.push(trimmed);
      continue;
    } else {
      flushTable(i);
    }

    if (!trimmed) {
      elements.push(<div key={i} className="h-4" />);
      continue;
    }

    // Header detection (### Header)
    if (trimmed.startsWith('#')) {
      const level = (trimmed.match(/^#+/) || ['#'])[0].length;
      // Remove header symbols (e.g., ### )
      const cleanText = trimmed.replace(/^#+\s*/, '');
      const headerClass = level === 1 ? "text-2xl font-black mt-6 mb-3 text-[#191F28]" : 
                         level === 2 ? "text-xl font-bold mt-5 mb-2 text-[#191F28]" : 
                         "ai-header"; 
      
      elements.push(
        <span key={i} className={`${headerClass} block break-keep`}>
          {processBold(cleanText)}
        </span>
      );
      continue;
    }

    // List detection
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('●')) {
      const cleanText = trimmed.replace(/^([-*●])\s*/, '');
      elements.push(
        <div key={i} className="ai-list-item">
          <span className="ai-list-bullet">●</span>
          <span className="flex-1 text-[#333D4B] leading-relaxed text-[16px] break-keep">{processBold(cleanText)}</span>
        </div>
      );
      continue;
    }

    // Default paragraph
    elements.push(
      <p key={i} className="text-[#4E5968] leading-relaxed py-1 text-[16px] break-keep">
        {processBold(line)}
      </p>
    );
  }
  
  flushTable(lines.length);

  return <div className="space-y-1">{elements}</div>;
};

const TableBlock: React.FC<{ rows: string[] }> = ({ rows }) => {
  const dataRows = rows.filter(r => !r.match(/^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)*\|?$/));
  if (dataRows.length < 1) return null;

  const header = dataRows[0].split('|').filter(c => c.trim() !== "").map(c => c.trim());
  const bodyRows = dataRows.slice(1).map(row => 
    row.split('|').filter(c => c.trim() !== "").map(c => c.trim())
  );

  return (
    <div className="my-6 overflow-x-auto rounded-[20px] border border-[#F2F4F6]">
      <table className="w-full text-left border-collapse bg-white min-w-max">
        <thead className="bg-[#F9FAFB]">
          <tr>
            {header.map((col, idx) => (
              <th key={idx} className="px-5 py-4 text-[13px] font-bold text-[#4E5968] uppercase tracking-wide">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F2F4F6]">
          {bodyRows.map((row, rowIdx) => {
            const isTargetRow = row[0]?.includes('★');
            return (
              <tr key={rowIdx} className={`transition-colors ${isTargetRow ? 'bg-blue-50' : 'hover:bg-[#F9FAFB]'}`}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className={`px-5 py-4 text-[15px] text-[#333D4B] ${isTargetRow ? 'font-bold text-[#3182F6]' : 'font-medium'} break-keep`}>
                    {processBold(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Robust function to replace **text** with styled spans and REMOVE the asterisks
export function processBold(text: string) {
  if (typeof text !== 'string') return text;
  if (!text.includes('**')) return text;

  const regex = /\*\*(.*?)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="ai-bold">
        {match[1]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
