import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import CreateListing from './pages/CreateListing'
import Exchanges from './pages/Exchanges'
import ExchangeDetail from './pages/ExchangeDetail'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/listings" element={
          <ProtectedRoute><Listings /></ProtectedRoute>
        } />
        <Route path="/listings/create" element={
          <ProtectedRoute><CreateListing /></ProtectedRoute>
        } />
        <Route path="/listings/:id" element={
          <ProtectedRoute><ListingDetail /></ProtectedRoute>
        } />
        <Route path="/exchanges" element={
          <ProtectedRoute><Exchanges /></ProtectedRoute>
        } />
        <Route path="/exchanges/:id" element={
          <ProtectedRoute><ExchangeDetail /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
