import RcPagination from 'rc-pagination'
import { ChevronLeft, ChevronRight } from 'react-feather'

interface PaginationProps {
  page: number
  totalItems: number
  itemsPerPage: number
  hideOnSinglePage?: boolean
  onPageChange: (newPage: number) => void
}

export function Pagination({
  page,
  totalItems,
  itemsPerPage,
  onPageChange,
  hideOnSinglePage = false,
}: PaginationProps) {
  return (
    <RcPagination
      className="swapr-pagination"
      current={page}
      total={totalItems}
      pageSize={itemsPerPage}
      hideOnSinglePage={hideOnSinglePage}
      simple
      showTitle={false}
      onChange={onPageChange}
      prevIcon={<ChevronLeft size={14} />}
      nextIcon={<ChevronRight size={14} />}
    />
  )
}
