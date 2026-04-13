import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div>
      
      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default Layout;
