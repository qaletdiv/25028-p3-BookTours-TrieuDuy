import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import TourDetailPage from "./pages/TourDetailPage";
import ToursPage from "./pages/ToursPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tours" element={<ToursPage />} />
        <Route path="tours/:slug" element={<TourDetailPage />} />
        <Route path="*" element={<ToursPage />} />
      </Route>
    </Routes>
  );
}
