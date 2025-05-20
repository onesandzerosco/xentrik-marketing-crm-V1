
import { FileTag } from './types';

/**
 * Simple function to assign colors based on tag name
 */
export const getTagColor = (tagName: string): string => {
  const colors = ['red', 'green', 'blue', 'purple', 'pink', 'amber', 'gray'];
  const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Filter files that contain at least one of the selected tags
 */
export const filterFilesByTags = (files: any[], tagNames: string[]) => {
  if (tagNames.length === 0) return files;
  
  // Output debugging information to the browser console
  console.log('DEBUG TAG FILTERING:');
  console.log('- Selected tag names:', tagNames);
  console.log('- Files to filter:', files.length);
  
  // Check if files have tags property
  const filesWithTags = files.filter(file => file.tags && file.tags.length > 0).length;
  console.log('- Files with tags:', filesWithTags);
  
  // Log tag names for the first few files
  const sampleFiles = files.slice(0, 3);
  sampleFiles.forEach(file => {
    console.log(`- Sample file "${file.name}" has tags:`, file.tags || []);
  });
  
  // Filter files that have at least ONE of the selected tags
  const filtered = files.filter(file => {
    if (!file.tags || file.tags.length === 0) {
      return false;
    }
    
    // Check if any of the file's tags match any of the selected tag names
    const hasMatchingTag = file.tags.some(fileTag => 
      tagNames.includes(fileTag)
    );
    
    return hasMatchingTag;
  });
  
  console.log('- Files after filtering:', filtered.length);
  
  // Log the first few filtered files
  const sampleFilteredFiles = filtered.slice(0, 3);
  sampleFilteredFiles.forEach(file => {
    console.log(`- Filtered file "${file.name}" with tags:`, file.tags);
  });
  
  return filtered;
};
