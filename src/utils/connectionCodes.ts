
// Utility functions for handling connection codes
import { customAlphabet } from 'nanoid';

// Constants
const CODE_LENGTH = 8;
// Excluding 0, O, 1, I to avoid confusion
const ALLOWED_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; 

// Generate a secure random connection code
export const generateConnectionCode = (): string => {
  const nanoid = customAlphabet(ALLOWED_CHARS, CODE_LENGTH);
  return nanoid();
};

// Efficiently validate connection code format and characters
export const isValidConnectionCode = (code: string): boolean => {
  if (!code || code.length !== CODE_LENGTH) return false;
  
  // Use regex for faster validation
  const validCharsRegex = new RegExp(`^[${ALLOWED_CHARS}]+$`);
  return validCharsRegex.test(code);
};

// Format code with spaces for better readability (e.g., "ABCD EFGH")
export const formatConnectionCode = (code: string): string => {
  if (!code || code.length !== CODE_LENGTH) return code;
  return `${code.substring(0, 4)} ${code.substring(4)}`;
};

// Parse formatted code by removing spaces
export const parseConnectionCode = (formattedCode: string): string => {
  return formattedCode.replace(/\s/g, '');
};
