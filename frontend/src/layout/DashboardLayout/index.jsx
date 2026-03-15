import React, { useEffect } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config";
import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const currentUsername = authState.user?.userId?.username;
  const visibleProfiles = authState.all_users.filter(
    (profile) => profile.userId?.username !== currentUsername,
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token === null) {
      router.push("/login");
      return;
    }

    dispatch(setTokenIsThere());

    if (!authState.profileFetched) {
      dispatch(getAboutUser({ token }));
    }

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [
    authState.all_profiles_fetched,
    authState.profileFetched,
    dispatch,
    router,
  ]);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.homeContainer}>
          <div className={styles.homeContainer__leftBar}>
            <div
              onClick={() => {
                router.push("/dashboard");
              }}
              className={styles.sideBarOption}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
              <p>Scroll</p>
            </div>
            <div
              onClick={() => {
                router.push("/discover");
              }}
              className={styles.sideBarOption}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <p>Discover</p>
            </div>
            <div
              onClick={() => {
                router.push("/my_connections");
              }}
              className={styles.sideBarOption}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                  clipRule="evenodd"
                />
              </svg>
              <p>My connections</p>
            </div>
          </div>
          <div className={styles.homeContainer__feed}>{children}</div>
          <div className={styles.homeContainer__extra}>
            <h3 className={styles.extraContainer__title}>Top Profiles</h3>
            {authState.all_profiles_fetched &&
              visibleProfiles.map((profile) => {
                return (
                  <div
                    key={profile._id}
                    className={styles.extraContainer__profile}
                    onClick={() => {
                      router.push(`/view_profile/${profile.userId.username}`);
                    }}
                  >
                    <img
                      className={styles.extraContainer__profileImage}
                      src={`${BASE_URL}/${profile.userId.profilePicture}`}
                      alt={`${profile.userId.name} profile`}
                    />
                    <div className={styles.extraContainer__profileContent}>
                      <p className={styles.extraContainer__profileName}>
                        {profile.userId.name}
                      </p>
                      <p className={styles.extraContainer__profileUsername}>
                        @{profile.userId.username}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
