export function isOwner(user: any) {
    return user?.role?.name === "OWNER";
  }
  
  export function isAdmin(user: any) {
    return user?.role?.name === "ADMIN";
  }
  
  export function isManager(user: any) {
    return user?.role?.name === "MANAGER";
  }
  
  export function isEmployee(user: any) {
    return user?.role?.name === "EMPLOYEE";
  }
  
  export function canManageCompany(user: any) {
    return ["OWNER"].includes(
      user?.role?.name
    );
  }
  
  export function canManageHR(user: any) {
    return ["OWNER", "ADMIN"].includes(
      user?.role?.name
    );
  }
  
  export function canManageCRM(user: any) {
    return ["OWNER", "ADMIN", "MANAGER"].includes(
      user?.role?.name
    );
  }
  
  export function canManageProjects(user: any) {
    return ["OWNER", "ADMIN", "MANAGER"].includes(
      user?.role?.name
    );
  }