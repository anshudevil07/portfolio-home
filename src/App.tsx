import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FormPage from "./pages/FormPage";
import SuccessPage from "./pages/SuccessPage";
import PortfolioView from "./pages/PortfolioView";
import EditPage from "./pages/EditPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/create" element={<FormPage />} />
    <Route path="/success/:slug" element={<SuccessPage />} />
    <Route path="/portfolio/:slug" element={<PortfolioView />} />
    <Route path="/edit/:token" element={<EditPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
