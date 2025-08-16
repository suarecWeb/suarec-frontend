import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  ...props
}: PaginationProps) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Añadir primera página
    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={`h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors flex-shrink-0 ${
            1 === currentPage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          1
        </button>,
      );

      // Añadir elipsis si hay un salto
      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="start-ellipsis"
            className="h-10 w-10 flex items-center justify-center text-gray-500 flex-shrink-0"
          >
            ...
          </span>,
        );
      }
    }

    // Añadir páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors flex-shrink-0 ${
            i === currentPage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          {i}
        </button>,
      );
    }

    // Añadir última página
    if (endPage < totalPages) {
      // Añadir elipsis si hay un salto
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span
            key="end-ellipsis"
            className="h-10 w-10 flex items-center justify-center text-gray-500 flex-shrink-0"
          >
            ...
          </span>,
        );
      }

      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors flex-shrink-0 ${
            totalPages === currentPage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  };

  return (
    <div
      className={`flex items-center justify-center space-x-2 py-6 w-full max-w-full overflow-x-auto ${className || ""}`}
      {...props}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`h-10 w-10 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
          currentPage <= 1 
            ? "opacity-50 cursor-not-allowed bg-gray-100" 
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
        }`}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`h-10 w-10 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
          currentPage >= totalPages
            ? "opacity-50 cursor-not-allowed bg-gray-100"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
        }`}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export { Pagination };
