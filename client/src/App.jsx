import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ListingsPage from './pages/ListingsPage.jsx';
export default function App() { return <BrowserRouter><AuthProvider><Layout><Routes><Route path="/" element={<ListingsPage />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /></Routes></Layout></AuthProvider></BrowserRouter>; }
