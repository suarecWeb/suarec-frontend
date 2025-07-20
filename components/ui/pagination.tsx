import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center",
            1 === currentPage
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted",
          )}
        >
          1
        </button>,
      );

      // Añadir elipsis si hay un salto
      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="start-ellipsis"
            className="h-8 w-8 flex items-center justify-center"
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
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center",
            i === currentPage
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted",
          )}
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
            className="h-8 w-8 flex items-center justify-center"
          >
            ...
          </span>,
        );
      }

      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center",
            totalPages === currentPage
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted",
          )}
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-2 py-4",
        className,
      )}
      {...props}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "h-8 w-8 rounded-md flex items-center justify-center",
          currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-muted",
        )}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "h-8 w-8 rounded-md flex items-center justify-center",
          currentPage >= totalPages
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted",
        )}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export { Pagination };
