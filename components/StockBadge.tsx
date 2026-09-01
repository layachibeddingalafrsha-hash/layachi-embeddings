interface StockBadgeProps {
  stock: number;
  locale: 'ar' | 'fr';
  className?: string;
}

export function StockBadge({ stock, locale, className = '' }: StockBadgeProps) {
  const getStockInfo = () => {
    if (stock === 0) {
      return {
        text: locale === 'ar' ? 'غير متوفر' : 'Rupture de stock',
        bgColor: 'bg-red-500',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    } else if (stock <= 5) {
      return {
        text: locale === 'ar' ? 'مخزون منخفض' : 'Stock limité',
        bgColor: 'bg-orange-500',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    } else {
      return {
        text: locale === 'ar' ? 'متوفر' : 'En stock',
        bgColor: 'bg-green-500',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    }
  };

  const info = getStockInfo();

  return (
    <div 
      className={`absolute top-2 ${locale === 'ar' ? 'right-2' : 'left-2'} z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${info.bgColor} text-white shadow-lg ${className}`}
    >
      {info.icon}
      <span>{info.text}</span>
    </div>
  );
}
