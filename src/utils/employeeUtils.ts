
// Find the object literal that's causing the error and update it
// Instead of:
// const roleCount: Record<TeamMemberRole, number> = { "Chatters": 0, ... }

// Use this:
const roleCount: Record<string, number> = { 
  "Admin": 0,
  "Manager": 0,
  "Employee": 0,
  "Chatters": 0,
  "Developer": 0,
  "Editor": 0,
  // Add any other roles that might be needed
};

// Mock function to get creator names from IDs
// This would normally fetch from an API or database
export const getCreatorNames = (creatorIds: string[]): string[] => {
  // This is a placeholder implementation
  // In a real app, you would fetch the actual creator names based on IDs
  return creatorIds.map(id => `Creator ${id.substring(0, 5)}`);
};
