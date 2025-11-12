import { useState, useEffect, useRef, useCallback } from 'react';
import { categoryApi } from '@/api';
import type { Category } from '@/types/category.types';

interface CategorySelectProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const CategorySelect = ({
  name,
  label,
  placeholder = "Select Category",
  required = false,
  disabled = false,
  value,
  onChange,
  className = ""
}: CategorySelectProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const perPage = 20; // Load 20 categories at a time

  // Fetch categories with pagination
  const fetchCategories = useCallback(async (page: number, search: string = '', append: boolean = false) => {
    if (loading || (!append && !hasMore && page > 1)) {
      console.log('🚫 API call blocked:', { loading, hasMore, page, append });
      return;
    }
    
    console.log('📡 API call made:', { page, search, append, hasMore });
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
        setHasMore(true); // Reset hasMore for new search
      }
      
      setHasMore(newCategories.length === perPage);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setHasMore(false); // Set hasMore to false on error
    } finally {
      setLoading(false);
    }
  }, [loading, perPage, hasMore]);

  // Initial load - when dropdown is opened or when value is provided
  useEffect(() => {
    if (isOpen && !initialLoadDone && !loading) {
      fetchCategories(1);
      setInitialLoadDone(true);
    }
  }, [isOpen, initialLoadDone, loading, fetchCategories]);

  // Load initial category when value is provided but categories not loaded
  useEffect(() => {
    if (value && categories.length === 0 && !loading && !initialLoadDone) {
      console.log('🔄 Loading initial category for value:', value);
      fetchCategories(1);
      setInitialLoadDone(true);
    }
  }, [value, categories.length, loading, initialLoadDone, fetchCategories]);

  // Handle value changes - ensure we have the category loaded
  useEffect(() => {
    if (value && categories.length > 0) {
      const categoryExists = categories.find(cat => cat.id.toString() === value);
      if (!categoryExists && hasMore && !loading) {
        console.log('🔍 Value category not found, loading more categories');
        fetchCategories(currentPage + 1, '', true);
      }
    }
  }, [value, categories, hasMore, loading, currentPage, fetchCategories]);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categories, searchTerm]);

  // Handle search with debounce - only when dropdown is open and user is typing
  useEffect(() => {
    if (!isOpen || loading || !isUserTyping) return;
    
    // Only make API calls if user is actively typing (searchTerm has content)
    if (searchTerm.trim() === '') return;
    
    const timeoutId = setTimeout(() => {
      console.log('🔍 Search API call triggered');
      fetchCategories(1, searchTerm, false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchCategories, isOpen, loading, isUserTyping]);

  // Reset typing state after user stops typing
  useEffect(() => {
    if (!isUserTyping) return;
    
    const timeoutId = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isUserTyping]);

  // Handle scroll to load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Only load more if ALL conditions are met:
    // 1. We're near the bottom (within 5px for more precision)
    // 2. There are more categories to load
    // 3. We're not already loading
    // 4. We have some categories already loaded
    // 5. We're not in the middle of a search
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 5;
    const shouldLoadMore = isNearBottom && hasMore && !loading && categories.length > 0 && searchTerm.trim() === '';
    
    if (shouldLoadMore) {
      console.log('📜 Scroll triggered load more');
      fetchCategories(currentPage + 1, searchTerm, true);
    }
  }, [currentPage, hasMore, loading, searchTerm, fetchCategories, categories.length]);

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    onChange?.(category.id.toString());
    setIsOpen(false);
    setSearchTerm('');
    setIsUserTyping(false);
  };

  // Handle dropdown toggle
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => searchRef.current?.focus(), 100);
      } else {
        // Reset search and typing state when closing dropdown
        setSearchTerm('');
        setIsUserTyping(false);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setIsUserTyping(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = categories.find(cat => cat.id.toString() === value);
  
  // Fallback display text when category is not loaded yet
  const displayText = selectedCategory ? selectedCategory.name : (value ? (loading ? 'Loading...' : `Category ${value}`) : placeholder);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
            ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
          `}
        >
          <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsUserTyping(true);
                }}
                onBlur={() => setIsUserTyping(false)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Categories list */}
            <div
              ref={listRef}
              className="max-h-48 overflow-y-auto"
              onScroll={handleScroll}
            >
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
        name={name}
        value={value || ''}
      />
    </div>
  );
};
