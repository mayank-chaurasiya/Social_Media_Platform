import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect } from "react";
import styles from "./profile.module.css";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config";
import { getAboutUser } from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";

const ProfilePage = () => {
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.posts);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    dispatch(getAboutUser({ token }));
    dispatch(getAllPosts());
  }, [dispatch]);

  const userProfile = authState.user;
  const profileUser = userProfile?.userId;
  const userPosts = postState.posts.filter(
    (post) => post.userId?._id === profileUser?._id,
  );
  const pastWork = userProfile?.pastWork ?? [];

  if (!profileUser) {
    return (
      <UserLayout>
        <DashboardLayout />
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <div className={styles.backDrop__overlay}>
              <p>
                <i class="fa-regular fa-pen-to-square"></i>&nbsp;Edit
              </p>
            </div>
            <img
              className={styles.backDrop}
              src={`${BASE_URL}/${profileUser.profilePicture}`}
              alt={`${profileUser.name} profile`}
            />
          </div>
          <div className={styles.profileContainer__details}>
            <div className={styles.profileDetails__parent}>
              <div className={styles.profileDetails__leftBar}>
                <div className={styles.leftBar}>
                  <p className={styles.profile__name}>{profileUser.name}</p>
                  <p className={styles.profile__username}>
                    @{profileUser.username}
                  </p>
                </div>

                <div>
                  <p>{userProfile.bio}</p>
                </div>
              </div>

              <div className={styles.profileDetails__rightBar}>
                <h3>Recent Activity</h3>
                {userPosts.map((post) => {
                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card__profileContainer}>
                          {post.media !== "" ? (
                            <img
                              src={`${BASE_URL}/${post.media}`}
                              alt="Post media"
                            />
                          ) : (
                            <div
                              style={{ width: "3.4rem", height: "3.4rem" }}
                            ></div>
                          )}
                        </div>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={styles.workHistory}>
            <p className={styles.workHistory__title}>Work History</p>
            <div className={styles.workHistory__container}>
              {pastWork.map((work, index) => {
                return (
                  <div key={index} className={styles.workHistory__Card}>
                    <p className={styles.workHistory__position}>
                      {work.company} - {work.position}
                    </p>
                    <p>{work.years} years</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default ProfilePage;
