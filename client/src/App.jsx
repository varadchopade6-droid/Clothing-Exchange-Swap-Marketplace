import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ListingsPage from './pages/ListingsPage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import SwapsPage from './pages/SwapsPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CommercePage from './pages/CommercePage.jsx';
export default function App() { return <BrowserRouter><AuthProvider><Layout><Routes><Route path="/" element={<ListingsPage />} /><Route path="/listings/:id" element={<DetailPage />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /><Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /><Route path="/swaps" element={<ProtectedRoute><SwapsPage /></ProtectedRoute>} /><Route path="/transactions" element={<ProtectedRoute><CommercePage /></ProtectedRoute>} /><Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} /><Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} /></Routes></Layout></AuthProvider></BrowserRouter>; }
