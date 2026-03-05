import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React from "react";

const MyConnectionsPage = () => {
  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h2>My Connections</h2>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default MyConnectionsPage;
