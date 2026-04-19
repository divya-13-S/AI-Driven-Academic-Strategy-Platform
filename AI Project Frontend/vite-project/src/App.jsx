import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

import Login from "./pages/Login.jsx";
import Student from "./pages/Student.jsx";
import Faculty from "./pages/Faculty.jsx";
import FacultyMaterials from "./pages/FacultyMaterials.jsx";
import Admin from "./pages/Admin.jsx";
import Subjectdetails from "./pages/Subjectdetails.jsx";
import Signup from "./pages/Signup.jsx";
import Feedback from "./pages/Feedback.jsx";
import AdminFeedback from "./pages/Adminfeedback.jsx";
import AISuggestionsPage from "./pages/AISuggestionsPage.jsx";



function PrivateRoute({ children, roleRequired }) {
  const role = localStorage.getItem("role");

  if (role !== roleRequired) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/student"
          element={
            <PrivateRoute roleRequired="student">
              <Student />
            </PrivateRoute>
          }
        />

        <Route
          path="/faculty"
          element={
            <PrivateRoute roleRequired="faculty">
              <Faculty />
            </PrivateRoute>
          }
        />

        <Route
          path="/faculty-materials"
          element={
            <PrivateRoute roleRequired="faculty">
              <FacultyMaterials />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute roleRequired="admin">
              <Admin />
            </PrivateRoute>
          }
        />

        <Route path="/subject/:id" element={<Subjectdetails />} />
        <Route path="/signup" element = {<Signup/>} />

        <Route path="/feedback" element ={<Feedback/>} />

        <Route path="/admin-feedback" element={<AdminFeedback/>}/>

        <Route
          path="/ai-suggestions"
          element={
            <PrivateRoute roleRequired="student">
              <AISuggestionsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
