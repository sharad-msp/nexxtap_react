import React, { useState } from 'react';
import { cn } from '@/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { IconButton } from './IconButton';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
}

interface Action<T> {
  label?: string; // Made optional for icon-only buttons
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
  show?: (item: T) => boolean;
  hideOnMobile?: boolean;
  disabled?: (item: T) => boolean;
  tooltip?: (item: T) => string | undefined;
  title?: string;
  'aria-label'?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  actions?: Action<T>[];
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  selectedItems?: T[];
  keyField?: keyof T;
  striped?: boolean;
  hover?: boolean;
}

export function Table<T>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className,
  pagination,
  actions,
  selectable = false,
  onSelectionChange,
  selectedItems,
  keyField,
  striped = true,
  hover = true,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Ensure selectedItems is always an array
  const safeSelectedItems = selectedItems || [];
  
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(safeData);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...safeSelectedItems, item]);
    } else {
      onSelectionChange?.(safeSelectedItems.filter(selected => selected !== item));
    }
  };

  const isSelected = (item: T) => {
    return safeSelectedItems.includes(item);
  };

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse hidden sm:block"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse hidden md:block"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse hidden lg:block"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={safeSelectedItems.length === safeData.length && safeData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:bg-gray-100 transition-colors",
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.hideOnMobile && 'hidden md:table-cell',
                      column.width
                    )}
                    style={column.width ? { width: column.width } : undefined}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={cn(
                      "flex items-center",
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}>
                      <span className="truncate">{column.header}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="ml-1 text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="w-32 px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                    className="px-4 sm:px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emptyMessage}</p>
                        <p className="text-sm text-gray-500">No data available to display</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                safeData.map((item, index) => (
                  <tr
                    key={keyField ? String(item[keyField]) : index}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-gray-50',
                      striped && index % 2 === 0 && 'bg-gray-50',
                      hover && 'hover:bg-gray-50 transition-colors'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={isSelected(item)}
                          onChange={(e) => handleSelectItem(item, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-4 text-sm text-gray-900",
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.hideOnMobile && 'hidden md:table-cell'
                        )}
                      >
                        {column.render ? column.render(item) : String(item[column.key as keyof T] || '')}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="w-32 px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {actions.map((action, actionIndex) => {
                            if (action.show && !action.show(item)) return null;
                            
                            const isDisabled = action.disabled ? action.disabled(item) : false;
                            const tooltipText = action.tooltip ? action.tooltip(item) : undefined;
                            
                            const isIconOnly = action.icon && !action.label;
                            
                            return (
                              <div key={actionIndex} className="relative group">
                                {isIconOnly ? (
                                  <IconButton
                                    icon={action.icon}
                                    variant={action.variant || 'ghost'}
                                    size="sm"
                                    onClick={() => !isDisabled && action.onClick(item)}
                                    disabled={isDisabled}
                                    title={action.title || tooltipText}
                                    aria-label={action['aria-label'] || action.title || tooltipText}
                                    className={cn(
                                      action.hideOnMobile && 'hidden sm:inline-flex',
                                      isDisabled && "opacity-50 cursor-not-allowed"
                                    )}
                                  />
                                ) : (
                                  <Button
                                    variant={action.variant || 'ghost'}
                                    size="sm"
                                    onClick={() => !isDisabled && action.onClick(item)}
                                    disabled={isDisabled}
                                    className={cn(
                                      "h-8 px-2",
                                      action.hideOnMobile && 'hidden sm:inline-flex',
                                      isDisabled && "opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                    {action.icon}
                                    <span className="text-xs ml-1 hidden sm:inline">{action.label}</span>
                                  </Button>
                                )}
                                {tooltipText && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    {tooltipText}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{pagination.currentPage}</span> of{' '}
              <span className="font-medium">{pagination.totalPages}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="hidden sm:inline"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="sm:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="hidden sm:inline"
            >
              <span className="mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="sm:hidden"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
