
// Find the object literal that's causing the error and update it
// Instead of:
// const roleCount: Record<TeamMemberRole, number> = { "Chatters": 0, ... }

// Use this:
const roleCount: Record<string, number> = { 
  "Admin": 0,
  "Manager": 0,
  "Employee": 0,
  "Chatters": 0,
  "Creative Director": 0,
  "Developer": 0,
  "Editor": 0,
  // Add any other roles that might be needed
};
