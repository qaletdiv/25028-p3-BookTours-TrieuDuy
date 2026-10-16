import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountPage from "./pages/AccountPage";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TourDetailPage from "./pages/TourDetailPage";
import ToursPage from "./pages/ToursPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tours" element={<ToursPage />} />
        <Route path="tours/:slug" element={<TourDetailPage />} />
        <Route path="dang-ky" element={<RegisterPage />} />
        <Route path="dang-nhap" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="thanh-toan" element={<CheckoutPage />} />
          <Route path="xac-nhan/:code" element={<BookingConfirmPage />} />
          <Route path="tai-khoan" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<ToursPage />} />
      </Route>
    </Routes>
  );
}
