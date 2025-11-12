import type { RoleType } from '@/types/role.types';

/**
 * Format role type for display
 */
export function formatRoleType(roleType: RoleType | null | undefined): string {
  if (!roleType) return 'Not Set';
  
  switch (roleType) {
    case 'admin':
      return 'Admin';
    case 'pos':
      return 'POS';
    case 'kds':
      return 'KDS';
    default:
      return roleType;
  }
}

/**
 * Get role type badge color
 */
export function getRoleTypeBadgeColor(roleType: RoleType | null | undefined): string {
  if (!roleType) return 'bg-gray-100 text-gray-800';
  
  switch (roleType) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'pos':
      return 'bg-blue-100 text-blue-800';
    case 'kds':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get role type options for dropdown
 */
export function getRoleTypeOptions() {
  return [
    { value: '', label: 'Select Role Type' },
    { value: 'admin', label: 'Admin' },
    { value: 'pos', label: 'POS' },
    { value: 'kds', label: 'KDS' },
  ];
}

/**
 * Get role type description
 */
export function getRoleTypeDescription(roleType: RoleType | null | undefined): string {
  if (!roleType) return 'No role type assigned';
  
  switch (roleType) {
    case 'admin':
      return 'Full access to admin panel and system settings';
    case 'pos':
      return 'Access to Point of Sale system';
    case 'kds':
      return 'Access to Kitchen Display System';
    default:
      return 'Unknown role type';
  }
}

