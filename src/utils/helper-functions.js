import CryptoJS from 'crypto-js';
import { useEffect, useState } from 'react';

export const capitalise = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * returns the date in YY-MM-DD format
 * @param date: new Date() object
 */
export const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function encryptData({ data, key }) {
  console.log({ data });
  if (!data) return data;
  return CryptoJS.AES.encrypt(data, key).toString();
}

export function decryptData({ ciphertext, key }) {
  console.log({ ciphertext });
  if (!ciphertext) return ciphertext;

  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function useMediaQuery(query) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => result.removeEventListener('change', onChange);
  }, [query]);

  return value;
}
