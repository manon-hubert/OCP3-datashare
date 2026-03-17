import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Spinner } from '@chakra-ui/react';
import Layout from './components/common/Layout.tsx';
import DashboardLayout from './components/dashboard/DashboardLayout.tsx';
import { AuthProvider } from './contexts/AuthContext';

const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage.tsx'));
const MyFilesPage = lazy(() => import('./pages/MyFilesPage.tsx'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <Spinner
              size="xl"
              color="orange.500"
              role="status"
              aria-label="Chargement…"
            />
          }
        >
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/share/:token" element={<DownloadPage />} />
            </Route>
            <Route element={<DashboardLayout />}>
              <Route path="/my-files" element={<MyFilesPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
