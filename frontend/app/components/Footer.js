"use client";
import { FaHeart } from 'react-icons/fa';

const teamMembers = [
  { name: 'Ahmad Raza', id: '21-SE-32' },
  { name: 'Muhammad Hamza', id: '21-SE-60' },
  { name: 'Ameer Hamza', id: '21-SE-40' },
  { name: 'Muhammad Ahmad', id: '21-SE-10' },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* <div className="text-center md:text-left">
            <p className="text-lg font-semibold">
              Built by Software Engineering Department
            </p>
          </div> */}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {/* {teamMembers.map((member, index) => (
              <div key={index}>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-400">{member.id}</p>
              </div>
            ))} */}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Clearance Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
