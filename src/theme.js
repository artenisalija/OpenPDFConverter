import React from 'react';

const ColorModeContext = React.createContext({
  mode: 'dark',
  toggleMode: () => {}
});

export function ColorModeProvider({ children }) {
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    return () => root.classList.remove('dark');
  }, []);

  return <ColorModeContext.Provider value={{ mode: 'dark', toggleMode: () => {} }}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  return React.useContext(ColorModeContext);
}
