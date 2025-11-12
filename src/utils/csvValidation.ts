// CSV Validation Utilities

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  data: any[];
  totalRows: number;
  validRows: number;
}

export interface CategoryRow {
  name: string;
}

export interface ProductRow {
  name: string;
  category_name: string;
  base_price: string;
  description?: string;
}

// CSV Parser
export const parseCSV = (csvContent: string): string[][] => {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const result: string[][] = [];
  
  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    result.push(row);
  }
  
  return result;
};

// Category Validation
export const validateCategoryCSV = (csvContent: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const data: CategoryRow[] = [];
  
  try {
    const rows = parseCSV(csvContent);
    
    if (rows.length === 0) {
      errors.push({
        row: 0,
        column: 'general',
        message: 'CSV file is empty'
      });
      return { isValid: false, errors, warnings, data, totalRows: 0, validRows: 0 };
    }
    
    // Check header
    const header = rows[0];
    const expectedHeaders = ['name'];
    const missingHeaders = expectedHeaders.filter(h => !header.includes(h));
    
    if (missingHeaders.length > 0) {
      errors.push({
        row: 1,
        column: 'header',
        message: `Missing required columns: ${missingHeaders.join(', ')}`
      });
    }
    
    // Validate data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowErrors: ValidationError[] = [];
      
      // Check if row has enough columns
      if (row.length < expectedHeaders.length) {
        rowErrors.push({
          row: i + 1,
          column: 'general',
          message: `Row has ${row.length} columns, expected ${expectedHeaders.length}`
        });
      }
      
      // Validate name
      const nameIndex = header.indexOf('name');
      if (nameIndex !== -1 && row[nameIndex] !== undefined) {
        const name = row[nameIndex].trim();
        
        if (!name) {
          rowErrors.push({
            row: i + 1,
            column: 'name',
            message: 'Category name is required',
            value: name
          });
        } else if (name.length < 2) {
          rowErrors.push({
            row: i + 1,
            column: 'name',
            message: 'Category name must be at least 2 characters long',
            value: name
          });
        } else if (name.length > 100) {
          rowErrors.push({
            row: i + 1,
            column: 'name',
            message: 'Category name must be less than 100 characters',
            value: name
          });
        } else if (!/^[a-zA-Z0-9\s\-_&().,]+$/.test(name)) {
          warnings.push({
            row: i + 1,
            column: 'name',
            message: 'Category name contains special characters that may cause issues',
            value: name
          });
        }
        
        if (rowErrors.length === 0) {
          data.push({ name });
        }
      }
      
      errors.push(...rowErrors);
    }
    
    // Check for duplicate names
    const names = data.map(item => item.name.toLowerCase());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      const uniqueDuplicates = [...new Set(duplicates)];
      uniqueDuplicates.forEach(duplicate => {
        const indices = names.map((name, index) => name === duplicate ? index + 2 : -1).filter(i => i !== -1);
        errors.push({
          row: indices[0],
          column: 'name',
          message: `Duplicate category name found in rows: ${indices.join(', ')}`,
          value: duplicate
        });
      });
    }
    
  } catch (error) {
    errors.push({
      row: 0,
      column: 'general',
      message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data,
    totalRows: rows.length - 1, // Exclude header
    validRows: data.length
  };
};

// Product Validation
export const validateProductCSV = (csvContent: string, availableCategories: string[] = []): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const data: ProductRow[] = [];
  
  try {
    const rows = parseCSV(csvContent);
    
    if (rows.length === 0) {
      errors.push({
        row: 0,
        column: 'general',
        message: 'CSV file is empty'
      });
      return { isValid: false, errors, warnings, data, totalRows: 0, validRows: 0 };
    }
    
    // Check header
    const header = rows[0];
    const expectedHeaders = ['name', 'category_name', 'base_price', 'description'];
    const requiredHeaders = ['name', 'category_name', 'base_price'];
    const missingHeaders = requiredHeaders.filter(h => !header.includes(h));
    
    if (missingHeaders.length > 0) {
      errors.push({
        row: 1,
        column: 'header',
        message: `Missing required columns: ${missingHeaders.join(', ')}`
      });
    }
    
    // Validate data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowErrors: ValidationError[] = [];
      
      // Check if row has enough columns
      if (row.length < requiredHeaders.length) {
        rowErrors.push({
          row: i + 1,
          column: 'general',
          message: `Row has ${row.length} columns, expected at least ${requiredHeaders.length}`
        });
      }
      
      // Validate name
      const nameIndex = header.indexOf('name');
      if (nameIndex !== -1 && row[nameIndex] !== undefined) {
        const name = row[nameIndex].trim();
        
        if (!name) {
          rowErrors.push({
            row: i + 1,
            column: 'name',
            message: 'Product name is required',
            value: name
          });
        } else if (name.length < 2) {
          rowErrors.push({
            row: i + 1,
            column: 'name',
            message: 'Product name must be at least 2 characters long',
            value: name
          });
        } else if (name.length > 200) {
          rowErrors.push({
            row: i + 1,
            column: 'name',
            message: 'Product name must be less than 200 characters',
            value: name
          });
        }
      }
      
      // Validate category_name
      const categoryIndex = header.indexOf('category_name');
      if (categoryIndex !== -1 && row[categoryIndex] !== undefined) {
        const categoryName = row[categoryIndex].trim();
        
        if (!categoryName) {
          rowErrors.push({
            row: i + 1,
            column: 'category_name',
            message: 'Category name is required',
            value: categoryName
          });
        } else if (availableCategories.length > 0 && !availableCategories.includes(categoryName)) {
          rowErrors.push({
            row: i + 1,
            column: 'category_name',
            message: `Category "${categoryName}" does not exist. Available categories: ${availableCategories.join(', ')}`,
            value: categoryName
          });
        }
      }
      
      // Validate base_price
      const priceIndex = header.indexOf('base_price');
      if (priceIndex !== -1 && row[priceIndex] !== undefined) {
        const priceStr = row[priceIndex].trim();
        
        if (!priceStr) {
          rowErrors.push({
            row: i + 1,
            column: 'base_price',
            message: 'Base price is required',
            value: priceStr
          });
        } else {
          // Remove currency symbols and spaces
          const cleanPrice = priceStr.replace(/[$,\s]/g, '');
          const price = parseFloat(cleanPrice);
          
          if (isNaN(price)) {
            rowErrors.push({
              row: i + 1,
              column: 'base_price',
              message: 'Base price must be a valid number',
              value: priceStr
            });
          } else if (price < 0) {
            rowErrors.push({
              row: i + 1,
              column: 'base_price',
              message: 'Base price cannot be negative',
              value: priceStr
            });
          } else if (price > 999999.99) {
            rowErrors.push({
              row: i + 1,
              column: 'base_price',
              message: 'Base price cannot exceed 999,999.99',
              value: priceStr
            });
          }
        }
      }
      
      // Validate description (optional)
      const descIndex = header.indexOf('description');
      const description = descIndex !== -1 && row[descIndex] !== undefined ? row[descIndex].trim() : '';
      
      if (description && description.length > 1000) {
        warnings.push({
          row: i + 1,
          column: 'description',
          message: 'Description is very long and may be truncated',
          value: description
        });
      }
      
      if (rowErrors.length === 0) {
        data.push({
          name: row[nameIndex]?.trim() || '',
          category_name: row[categoryIndex]?.trim() || '',
          base_price: row[priceIndex]?.trim() || '',
          description: description || undefined
        });
      }
      
      errors.push(...rowErrors);
    }
    
    // Check for duplicate names within same category
    const categoryGroups = data.reduce((acc, item, index) => {
      const key = item.category_name.toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push({ ...item, originalIndex: index + 2 });
      return acc;
    }, {} as Record<string, Array<ProductRow & { originalIndex: number }>>);
    
    Object.entries(categoryGroups).forEach(([category, products]) => {
      const names = products.map(p => p.name.toLowerCase());
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      
      if (duplicates.length > 0) {
        const uniqueDuplicates = [...new Set(duplicates)];
        uniqueDuplicates.forEach(duplicate => {
          const indices = products
            .map((p, index) => p.name.toLowerCase() === duplicate ? p.originalIndex : -1)
            .filter(i => i !== -1);
          errors.push({
            row: indices[0],
            column: 'name',
            message: `Duplicate product name "${duplicate}" in category "${category}" found in rows: ${indices.join(', ')}`,
            value: duplicate
          });
        });
      }
    });
    
  } catch (error) {
    errors.push({
      row: 0,
      column: 'general',
      message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data,
    totalRows: rows.length - 1, // Exclude header
    validRows: data.length
  };
};

// File validation
export const validateCSVFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
    return { isValid: false, error: 'Please select a valid CSV file' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size cannot exceed 10MB' };
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }
  
  return { isValid: true };
};

// Preview CSV data
export const previewCSV = (csvContent: string, maxRows: number = 5): string[][] => {
  try {
    const rows = parseCSV(csvContent);
    return rows.slice(0, maxRows + 1); // Include header + maxRows of data
  } catch (error) {
    return [];
  }
};

// Generate sample CSV content
export const generateSampleCSV = (type: 'category' | 'product'): string => {
  if (type === 'category') {
    return `name
Electronics
Clothing
Books
Home & Garden
Sports & Outdoors`;
  } else {
    return `name,category_name,base_price,description
iPhone 15,Electronics,999.99,Latest smartphone from Apple
MacBook Pro,Electronics,1999.99,Professional laptop for developers
T-Shirt,Clothing,19.99,Comfortable cotton t-shirt
Jeans,Clothing,49.99,Classic blue denim jeans
Programming Book,Books,39.99,Learn programming fundamentals
Garden Tools,Home & Garden,29.99,Essential gardening equipment`;
  }
};
