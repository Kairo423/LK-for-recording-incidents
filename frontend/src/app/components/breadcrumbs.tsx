import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 text-[#6B7280] hover:text-[#1F2937] transition-colors"
      >
        <Home className="w-4 h-4" />
      </button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-[#6B7280]" />
          {index === items.length - 1 ? (
            <span className="text-[#1F2937] font-medium">{item.label}</span>
          ) : (
            <button
              onClick={item.onClick}
              className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
