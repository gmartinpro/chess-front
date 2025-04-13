import React, { createContext } from 'react';
import toast from 'react-hot-toast';

interface ErrorContextType {
  handleError: (error: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleError = (error: string) => {
    toast.error(error, {
      duration: 4000,
      position: 'top-right'
    });
  };

  return <ErrorContext.Provider value={{ handleError }}>{children}</ErrorContext.Provider>;
};

export { ErrorProvider, ErrorContext };
