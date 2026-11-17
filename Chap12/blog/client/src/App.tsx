import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import "./theme/chapter12.css";
import { store } from "./store/store";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { LoginForm } from "./components/LoginForm";
import { RegistrationForm } from "./components/RegistrationForm";
import { PostsList } from "./components/PostsList";
import { CreatePostForm } from "./components/CreatePostForm";
import { AuthorsAndTopicsPage } from "./components/AuthorsAndTopicsPage";
import { ProfilePage } from "./components/ProfilePage";
import { AdminDashboard } from "./components/AdminDashboard";
import UiApiProvider from "./common/context/ui-api/UiApiContext";

function App() {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <UiApiProvider>
          <BrowserRouter>
            <Navbar />
            <main>
              <Routes>
                {/* Public Authentication Routes (opened first when unauthenticated) */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegistrationForm />} />

                {/* Protected Application Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<PostsList />} />
                  <Route path="/create" element={<CreatePostForm />} />
                  <Route path="/edit/:workId" element={<CreatePostForm />} />
                  <Route path="/authors" element={<AuthorsAndTopicsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Role-Based Protected Admin Route */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </BrowserRouter>
        </UiApiProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default App;
