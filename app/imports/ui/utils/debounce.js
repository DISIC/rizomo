import { useState } from 'react';

export default function debounceFunc(func, wait) {
  // let timeout;
  const [timeout, settimeout] = useState(null);
  return (...args) => {
    const later = () => {
      settimeout(null);
      func(...args);
    };
    clearTimeout(timeout);
    settimeout(setTimeout(later, wait));
  };
}
