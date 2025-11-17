import React from 'react';

interface PdfTextDisplayProps {
  value: string;
  className?: string;
}

const PdfTextDisplay: React.FC<PdfTextDisplayProps> = ({ value, className }) => {
  return (
    <p className={`mt-2 p-1 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap text-sm ${className}`}>
      {value || 'N/A'}
    </p>
  );
};

export default PdfTextDisplay;