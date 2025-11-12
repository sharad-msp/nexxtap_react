import React, { useState, useEffect, useRef, useCallback } from 'react';
import { categoryApi } from '@/api';
import type { Category } from '@/types/category.types';

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryDropdown = ({
  value,
  onChange,
  placeholder = 'All Categories',
  disabled = false,
  className = '',
  size = 'md'
}: CategoryDropdownProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const perPage = 20; // Load 20 categories at a time

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  // Fetch categories with pagination
  const fetchCategories = useCallback(async (page: number, search: string = '', append: boolean = false) => {
    if (loading || (!append && !hasMore && page > 1)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await categoryApi.getAll({
        status: '1',
        per_page: perPage,
        page: page,
        search: search
      });

      const newCategories = response.data || [];
      
      if (append) {
        setCategories(prev => [...prev, ...newCategories]);
      } else {
        setCategories(newCategories);
        setHasMore(true);
      }
      
      setHasMore(newCategories.length === perPage);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load when dropdown is opened
  useEffect(() => {
    if (isOpen && !initialLoadDone && !loading) {
      fetchCategories(1);
      setInitialLoadDone(true);
    }
  }, [isOpen, initialLoadDone, loading, fetchCategories]);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = !searchTerm
        ? categories
        : categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setFilteredCategories(filtered);
    }
  }, [categories, searchTerm]);

  // Handle search with debounce
  useEffect(() => {
    if (!isOpen) return;
  
    const t = setTimeout(() => {
      fetchCategories(1, searchTerm);
    }, 300);
  
    return () => clearTimeout(t);
  }, [searchTerm, isOpen, fetchCategories]);
  

  // Handle scroll to load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 5 && hasMore && !loading && searchTerm === '') {
      fetchCategories(currentPage + 1, searchTerm, true);
    }
  }, [currentPage, hasMore, loading, searchTerm, fetchCategories]);

  
  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    onChange(category.id.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle "All Categories" selection
  const handleAllCategories = () => {
    onChange('all');
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle dropdown toggle
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => searchRef.current?.focus(), 100);
      } else {
        setSearchTerm('');
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = categories.find(cat => cat.id.toString() === value);
  const displayText = selectedCategory ? selectedCategory.name : (value === 'all' ? 'All Categories' : placeholder);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full text-left border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
            ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
            ${sizeClasses[size]}
          `}
        >
          <span className={selectedCategory || value === 'all' ? 'text-gray-900' : 'text-gray-500'}>
            {displayText}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Categories list */}
            <div
              ref={listRef}
              className="max-h-48 overflow-y-auto"
              onScroll={handleScroll}
            >
              {/* All Categories option */}
              <button
                type="button"
                onClick={handleAllCategories}
                className={`
                  w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none
                  ${value === 'all' ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}
                `}
              >
                All Categories
              </button>

              {filteredCategories.length > 0 ? (
                <>
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`
                        w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none
                        ${value === category.id.toString() ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}
                      `}
                    >
                      {category.name}
                    </button>
                  ))}
                  
                  {/* Loading indicator */}
                  {loading && (
                    <div className="px-3 py-2 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        Loading more categories...
                      </div>
                    </div>
                  )}
                  
                  {/* No more data indicator */}
                  {!hasMore && filteredCategories.length > 0 && (
                    <div className="px-3 py-2 text-center text-sm text-gray-500">
                      No more categories
                    </div>
                  )}
                </>
              ) : (
                <div className="px-3 py-2 text-center text-sm text-gray-500">
                  {loading ? 'Loading categories...' : 'No categories found'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        value={value}
      />
    </div>
  );
};
