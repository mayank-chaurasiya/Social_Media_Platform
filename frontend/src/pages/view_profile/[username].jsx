import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./userProfile.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

const ViewProfilePage = ({ userProfile }) => {
  const searchParameters = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const postReducer = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);
  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") }),
    );
  };

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(post);
  }, [postReducer.posts]);

  useEffect(() => {
    console.log(authState.connections, userProfile.userId._id);
    if (
      authState.connections.some(
        (user) => user.connectionId._id === userProfile.userId._id,
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connections.find(
          (user) => user.connectionId._id === userProfile.userId._id,
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
  }, [authState.connections]);

  useEffect(() => {
    getUserPost();
  }, []);

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
                            <img src={`${BASE_URL}/${post.media}`} />
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
              {userProfile.pastWork.map((work, index) => {
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
