
export interface RolePermission {
  rolename: string;
  preview: boolean;
  edit: boolean;
  upload: boolean;
  download: boolean;
  delete: boolean;
}

export const PERMISSION_ROLES = ['Admin', 'VA', 'Creator', 'Manager', 'Employee'];

export const DEFAULT_PERMISSIONS: RolePermission[] = [
  {
    rolename: 'Admin',
    preview: true,
    edit: true,
    upload: true,
    download: true,
    delete: true
  },
  {
    rolename: 'VA',
    preview: true,
    edit: true,
    upload: true,
    download: true,
    delete: false
  },
  {
    rolename: 'Creator',
    preview: true,
    edit: true,
    upload: true,
    download: true,
    delete: true
  },
  {
    rolename: 'Manager',
    preview: true,
    edit: true,
    upload: true,
    download: true,
    delete: false
  },
  {
    rolename: 'Employee',
    preview: true,
    edit: false,
    upload: false,
    download: true,
    delete: false
  }
];
