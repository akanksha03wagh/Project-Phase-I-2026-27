import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import DashboardLayout from "./components/DashboardLayout";
import Requirements from "./pages/Requirements";
import TestCases from "./pages/TestCases";
import Traceability from "./pages/Traceability";
import Coverage from "./pages/Coverage";
import DuplicateDetection from "./pages/DuplicateDetection";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/requirements"element={<Requirements />}/>
          <Route path="/test-cases"element={<TestCases />}/>
          <Route path="/traceability"element={<Traceability />}/>
          <Route path="/coverage"element={<Coverage />}/>
          <Route path="/duplicates"element={<DuplicateDetection />}/>
          <Route path="/reports" element={<Reports />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;