import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect } from "react";
import styles from "./userProfile.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  getMyConnectionsRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

const ViewProfilePage = ({ userProfile }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const postReducer = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);
  const workHistory = userProfile?.pastWork ?? [];
  const educationHistory = userProfile?.education ?? [];
  const userPosts = postReducer.posts.filter(
    (post) => post.userId.username === router.query.username,
  );
  const sentConnection = authState.connections.find(
    (user) => user.connectionId._id === userProfile.userId._id,
  );
  const receivedConnection = authState.connectionRequest.find(
    (user) => user.userId._id === userProfile.userId._id,
  );
  const activeConnection = sentConnection ?? receivedConnection;
  const isCurrentUserInConnection = Boolean(activeConnection);
  const isConnectionNull = activeConnection
    ? !activeConnection.status_accepted
    : true;

  useEffect(() => {
    const token = localStorage.getItem("token");
    dispatch(getAllPosts());

    if (token) {
      dispatch(getConnectionsRequest({ token }));
      dispatch(getMyConnectionsRequests({ token }));
    }
  }, [dispatch]);

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
                <div className={styles.profile__btns}>
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedBtn}>
                      {isConnectionNull ? "PENDING" : "CONNECTED"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userId._id,
                          }),
                        );
                      }}
                      className={styles.connectBtn}
                    >
                      CONNECT
                    </button>
                  )}
                  <div
                    className={styles.download__Button}
                    onClick={async () => {
                      const response = await clientServer.get(
                        `/user/download_resume?id=${userProfile.userId._id}`,
                      );
                      window.open(
                        `${BASE_URL}/${response.data.message}`,
                        "_blank",
                      );
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p>{userProfile.bio}</p>
                </div>
              </div>

              <div className={styles.profileDetails__rightBar}>
                <h3 className={styles.recentActivity__heading}>
                  Recent Activity
                </h3>
                <div className={styles.recentActivityList}>
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
                          <p className={styles.recentActivityText}>
                            {post.body}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.workHistory}>
            <p className={styles.workHistory__title}>Work History</p>
            <div className={styles.workHistory__container}>
              {workHistory.length === 0 && (
                <div className={styles.sectionEmpty}>
                  No work history added yet.
                </div>
              )}

              {workHistory.map((work, index) => {
                return (
                  <div key={index} className={styles.workHistory__Card}>
                    <p className={styles.workHistory__position}>
                      {work.company} - {work.position}
                    </p>
                    <p className={styles.workHistory__meta}>{work.years}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.workHistory}>
            <p className={styles.workHistory__title}>Education</p>
            <div className={styles.workHistory__container}>
              {educationHistory.length === 0 && (
                <div className={styles.sectionEmpty}>
                  No education details added yet.
                </div>
              )}

              {educationHistory.map((education, index) => {
                return (
                  <div key={index} className={styles.workHistory__Card}>
                    <p className={styles.workHistory__position}>
                      {education.school}
                    </p>
                    <p className={styles.workHistory__meta}>
                      {education.degree}
                    </p>
                    <p className={styles.workHistory__subtext}>
                      {education.fieldOfStudy}
                    </p>
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

export async function getServerSideProps(context) {
  const request = await clientServer.get("/user/get_profile_on_username", {
    params: {
      username: context.query.username,
    },
  });

  return { props: { userProfile: request.data.profile } };
}

export default ViewProfilePage;
