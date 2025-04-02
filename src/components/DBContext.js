// DBContext.js
import { createContext } from 'react';

export const DBContext = createContext();

export const DBProvider = ({ children, localDB }) => (
  <DBContext.Provider value={{ localDB }}>{children}</DBContext.Provider>
);