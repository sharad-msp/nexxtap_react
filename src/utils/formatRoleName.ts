/**
 * Formats a role name by capitalizing the first letter and replacing underscores with spaces
 * @param roleName - The role name to format (e.g., "store_admin")
 * @returns The formatted role name (e.g., "Store Admin")
 */
export const formatRoleName = (roleName: string): string => {
  if (!roleName) return '';
  
  return roleName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
