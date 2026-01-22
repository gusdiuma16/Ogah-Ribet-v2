import React from 'react';

export const Currency: React.FC<{ amount: number; className?: string }> = ({ amount, className = '' }) => {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return <span className={`font-jakarta ${className}`}>{formatter.format(amount)}</span>;
};