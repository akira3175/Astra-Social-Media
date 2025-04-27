const BASE_URL = import.meta.env.VITE_API_URL.replace('api/', '');

export const getImageUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  
  // If already a full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Remove any leading slashes and combine with base URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}${cleanPath}`;
};