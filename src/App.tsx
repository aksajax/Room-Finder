import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Wishlist from "./pages/Wishlist";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";


// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminCoupons from "./pages/admin/AdminCoupons";
import UserManagement from "./pages/admin/usermanagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WishlistProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Admin Routes (no main navbar/footer) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="rooms" element={<AdminRooms />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="usermanagement" element={<UserManagement />} />
              </Route>

              {/* Public Routes */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/rooms" element={<Rooms />} />
                      <Route path="/room/:id" element={<RoomDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/my-bookings" element={<MyBookings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
