import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== "...") {
      onPageChange(page);
    }
  };

  const getDesktopPages = () => {
    let pages = [];
    pages.push(1);

    if (currentPage > 3) pages.push("...");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const getMobilePages = () => {
    let pages = [1];
    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push("...", currentPage, "...");
    } else {
      pages.push("...");
    }
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <Pagination className="mb-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="px-2 sm:px-4 cursor-pointer"
          />
        </PaginationItem>

        <div className="hidden sm:flex">
          {getDesktopPages().map((page, idx) => (
            <PaginationItem key={idx}>
              {page === "..." ? (
                <span className="px-2">...</span>
              ) : (
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => handlePageClick(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </div>

        <div className="flex sm:hidden">
          {getMobilePages().map((page, idx) => (
            <PaginationItem key={idx}>
              {page === "..." ? (
                <span className="px-2">...</span>
              ) : (
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => handlePageClick(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </div>

        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-4 cursor-pointer"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
