/**
 * Utility functions for consistent status color handling
 */

export const getStatusColor = (status: boolean | number): string => {
  const isActive = typeof status === 'boolean' ? status : status === 1;
  return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

export const getStatusText = (status: boolean | number): string => {
  const isActive = typeof status === 'boolean' ? status : status === 1;
  return isActive ? 'Active' : 'Inactive';
};

export const getStatusBadgeVariant = (status: boolean | number): 'success' | 'destructive' => {
  const isActive = typeof status === 'boolean' ? status : status === 1;
  return isActive ? 'success' : 'destructive';
};

export const getStatusBadgeVariantSecondary = (status: boolean | number): 'success' | 'secondary' => {
  const isActive = typeof status === 'boolean' ? status : status === 1;
  return isActive ? 'success' : 'secondary';
};
