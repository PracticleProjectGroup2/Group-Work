import { Link, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./auth/RequireAuth";
import { BrowsePage } from "./pages/BrowsePage";
import { ItemPage } from "./pages/ItemPage";
import { ReportPage } from "./pages/ReportPage";
import { MyItemsPage } from "./pages/MyItemsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminPage } from "./pages/admin/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BrowsePage />} />
        <Route path="items/:id" element={<ItemPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route path="report" element={<ReportPage />} />
          <Route path="mine" element={<MyItemsPage />} />
        </Route>

        <Route element={<RequireAuth role="Admin" />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="text-center py-20">
              <p className="font-mono text-sm text-muted">#0404</p>
              <h1 className="text-2xl font-bold mt-2">This page went missing</h1>
              <Link to="/" className="btn btn-ghost mt-6">Back to items</Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
