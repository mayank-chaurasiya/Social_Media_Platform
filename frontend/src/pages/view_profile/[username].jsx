import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import styles from "./userProfile.module.css";

const ViewProfilePage = ({ userProfile }) => {
  const searchParameters = useSearchParams();
  useEffect(() => {});

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt=""
            />
          </div>
          <div className={styles.profileContainer__details}>
            <div className={styles.profileDetails__parent}>
              <div className={styles.profileDetails__leftBar}>
                <div className={styles.leftBar}>
                  <p className={styles.profile__name}>
                    {userProfile.userId.name}
                  </p>
                  <p className={styles.profile__username}>
                    @{userProfile.userId.username}
                  </p>
                </div>
              </div>
              <div className={styles.profileDetails__rightBar}></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export async function getServerSideProps(context) {
  console.log("form view");
  console.log(context.query.username);

  const request = await clientServer.get("/user/get_profile_on_username", {
    params: {
      username: context.query.username,
    },
  });

  const response = await request.data;
  console.log(response);

  return { props: { userProfile: request.data.profile } };
}

export default ViewProfilePage;
