const Header = ({ title, auth, logout }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:h-16">
          <div className="flex items-center mb-4 sm:mb-0">
            <img
              src="/logo.jpg"
              alt="UET Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
            />
            <span className="ml-3 text-xl sm:text-2xl font-semibold text-gray-800">
              {title}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center">
            {/* <span className="text-gray-700 mb-2 sm:mb-0 sm:mr-4">
              Welcome, {auth.user?.name || "User"}
            </span> */}
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
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
