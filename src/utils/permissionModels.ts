
export interface RolePermission {
  rolename: string;
  preview: boolean;
  edit: boolean;
  upload: boolean;
  download: boolean;
  delete: boolean;
}

// Only additional roles should be shown in Permission Settings
export const PERMISSION_ROLES = ['Admin', 'VA', 'Chatter', 'Developer', 'HR / Work Force'];

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
    rolename: 'Chatter',
    preview: true,
    edit: false,
    upload: false,
    download: true,
    delete: false
  },
  {
    rolename: 'Developer',
    preview: true,
    edit: true,
    upload: true,
    download: true,
    delete: false
  },
  {
    rolename: 'HR / Work Force',
    preview: true,
    edit: false,
    upload: false,
    download: true,
    delete: false
  }
];
