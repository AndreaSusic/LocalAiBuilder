import React, { createContext, useContext } from "react";
import tokens from "../tokens.json";

export const ThemeContext = createContext(tokens);
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ({children}) => (
  <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>
);