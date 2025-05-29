const Header = ({ title, auth, logout }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img
              src="/logo.jpg"
              alt="UET Logo"
              className="h-16 w-16 rounded-full"
            />
            <span className="ml-3 text-2xl font-semibold text-gray-800">
              {title}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-24">
              Welcome, {auth.user?.name || "User"}
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
