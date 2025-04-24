
// Utility functions for handling connection codes
import { customAlphabet } from 'nanoid';

const CODE_LENGTH = 8;
const ALLOWED_CHARS = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'; // Excluding 0 and O to avoid confusion

export const generateConnectionCode = () => {
  const nanoid = customAlphabet(ALLOWED_CHARS, CODE_LENGTH);
  return nanoid();
};

export const isValidConnectionCode = (code: string) => {
  if (!code || code.length !== CODE_LENGTH) return false;
  return code.split('').every(char => ALLOWED_CHARS.includes(char));
};

