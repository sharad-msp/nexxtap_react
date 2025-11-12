/**
 * Format permission names to display user-friendly labels
 * @param permissionName - The permission name (e.g., "user_create", "product_update")
 * @param displayName - Optional display name from database
 * @returns Formatted permission name for display
 */
export const formatPermissionName = (permissionName: string, displayName?: string): string => {
  // If display_name is provided, use it
  if (displayName) {
    return displayName;
  }

  // Fallback to formatting the permission name
  const parts = permissionName.split('_');
  
  if (parts.length === 1) {
    // Single word permission
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  
  // Multi-word permission
  const action = parts[0];
  const resource = parts.slice(1).join(' ');
  
  // Capitalize action and resource
  const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
  const capitalizedResource = resource
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `${capitalizedAction} ${capitalizedResource}`;
};

/**
 * Get permission display name with fallback
 * @param permission - Permission object with name and optional display_name
 * @returns Display name for the permission
 */
export const getPermissionDisplayName = (permission: { name: string; display_name?: string }): string => {
  return formatPermissionName(permission.name, permission.display_name);
};

/**
 * Format module names for display
 * @param moduleName - The module name (e.g., "user", "product")
 * @returns Formatted module name
 */
export const formatModuleName = (moduleName: string): string => {
  return moduleName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Role-based permission filtering based on backend PermissionService structure
 * Maps to the $defaultRolePermissions from the backend
 */
export const getRoleBasedPermissions = (roleType: string): string[] => {
  const rolePermissions: Record<string, string[]> = {
    'admin': [
      'user_view', 'user_list', 'user_create', 'user_update', 'user_status', 'user_delete',
      'role_view', 'role_list', 'role_create', 'role_update', 'role_status', 'role_delete',
      'category_view', 'category_list', 'category_create', 'category_update', 'category_status', 'category_delete',
      'attribute_view', 'attribute_list', 'attribute_create', 'attribute_update', 'attribute_status', 'attribute_delete',
      'product_view', 'product_list', 'product_create', 'product_update', 'product_status', 'product_delete',
      'order_view', 'order_list', 'order_create', 'order_update', 'order_status', 'order_delete',
      'discount_view', 'discount_list', 'discount_create', 'discount_update', 'discount_status', 'discount_delete',
      'tax_view', 'tax_list', 'tax_create', 'tax_update', 'tax_status', 'tax_delete',
      'attribute_view', 'attribute_list', 'attribute_create', 'attribute_update', 'attribute_status', 'attribute_delete',
      // 'report_view', 'report_export',
      'settings_view',
      'transaction_list',
      'refund_process',
      // 'store_view'
    ],
    'pos': [
      'attribute_view', 'attribute_list', 'attribute_create', 'attribute_update', 'attribute_status', 'attribute_delete',
      'category_view', 'category_list', 'category_create', 'category_update', 'category_status', 'category_delete',
      'product_view', 'product_list', 'product_create', 'product_update', 'product_status', 'product_delete',
      'order_view', 'order_list', 'order_create', 'order_update', 'order_status', 'order_delete',
      'discount_view', 'discount_list', 'discount_create', 'discount_update', 'discount_status', 'discount_delete',
      'transaction_list',
      'refund_process',
    ],
    'kds': [
      'order_view', 'order_list', 'order_update'
    ]
  };

  return rolePermissions[roleType] || [];
};

/**
 * Filter permissions based on role type
 * @param permissions - Array of all permissions
 * @param roleType - Selected role type ('admin', 'pos', 'kds')
 * @returns Filtered permissions relevant to the role type
 */
export const filterPermissionsByRoleType = (
  permissions: Array<{ id: number; name: string; display_name?: string; module?: string }>,
  roleType: string
): Array<{ id: number; name: string; display_name?: string; module?: string }> => {
  if (!roleType) {
    return permissions;
  }

  const allowedPermissionNames = getRoleBasedPermissions(roleType);
  
  return permissions.filter(permission => 
    allowedPermissionNames.includes(permission.name)
  );
};
