import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes/AppRoutes';
import { QuickAppSwitcher } from './components/common/QuickAppSwitcher';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
          <QuickAppSwitcher />
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="light"
            toastOptions={{
              style: {
                borderRadius: '16px',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
