// "use client";

// import { AdminAuthProvider } from "./context/AdminAuthContext";
// import Sidebar from "./components/AdminSidebar";
// import Navbar from "./components/AdminTopbar";
// import { usePathname } from "next/navigation";

// export default function AdminLayout({ children }) {
//   const pathname = usePathname();

//   // Hide layout on login pages
//   const hideLayout = pathname === "/admin" || pathname === "/admin/login";

//   return (
//     <AdminAuthProvider>
//       {/* TOPBAR OUTSIDE FLEX (so it is always full width) */}
//       {!hideLayout && (
//         <div className="sticky top-0 z-50 w-full">
//           <Navbar />
//         </div>
//       )}

//       <div className="min-h-screen flex bg-gray-100">

//         {/* Sidebar */}
//         {!hideLayout && <Sidebar />}

//         {/* Content Wrapper */}
//         <main className="flex-1 p-4 md:p-6 overflow-y-auto">
//           {children}
//         </main>
//       </div>
//     </AdminAuthProvider>
//   );
// }


"use client";

import { useState } from "react";
import Sidebar from "./components/AdminSidebar";
import Topbar from "./components/AdminTopbar";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

   const pathname = usePathname();

  // Hide layout on login pages
  const hideLayout = pathname === "/admin" || pathname === "/admin/login";

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
       {!hideLayout && (
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      )}

      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        {!hideLayout && <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />}
        

        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>

      </div>
    </div>
  );
}
