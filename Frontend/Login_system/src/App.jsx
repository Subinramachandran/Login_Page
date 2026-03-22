import { AuthProvider } from "./AuthContext";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;