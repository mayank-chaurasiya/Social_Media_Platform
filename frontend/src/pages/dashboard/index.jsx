import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import {
  createPost,
  getAllPosts,
  deletePost,
} from "@/config/redux/action/postAction";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "./dash.module.css";
import { BASE_URL } from "@/config";

const Dashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.posts);

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(
        getAboutUser({
          token: localStorage.getItem("token"),
        }),
      );
    }
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere]);

  const profilePicture = authState.user?.userId?.profilePicture;
  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();

  const handleUpload = async () => {
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts());
  };

  // useState(() => {
  //   setInterval(() => {
  //     dispatch(getAllPosts());
  //   }, 900);
  // });

  if (authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.wrapper}>
            <div className={styles.scrollComponent}>
              <div className={styles.createPostContainer}>
                {profilePicture && (
                  <img
                    className={styles.profileImg}
                    src={`${BASE_URL}/${profilePicture}`}
                    alt=""
                  />
                )}
                <textarea
                  className={styles.textAreaOfContent}
                  placeholder="What's in your mind ?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                ></textarea>
                <div className={styles.uploadSection}>
                  <label htmlFor="fileUpload">
                    <div className={styles.fab}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </label>
                  <input
                    onChange={(e) => setFileContent(e.target.files[0])}
                    type="file"
                    hidden
                    id="fileUpload"
                  />
                  {postContent.length > 0 && (
                    <div className={styles.uploadBtn} onClick={handleUpload}>
                      Post
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.postsContainer}>
                {postState.posts.map((post) => {
                  return (
                    <div key={post._id} className={styles.singleCard}>
                      <div className={styles.singleCard__profileContainer}>
                        <img
                          src={`${BASE_URL}/${profilePicture || ""}`}
                          className={styles.cardProfileImg}
                        />
                        <div className={styles.profileContainer__name}>
                          <div className={styles.profileHeader}>
                            <p>{post.userId.name}</p>

                            {post.userId._id === authState.user.userId._id && (
                              <div
                                onClick={async () => {
                                  await dispatch(
                                    deletePost({
                                      post_id: post._id,
                                    }),
                                  );
                                  await dispatch(getAllPosts());
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="size-6"
                                  style={{
                                    height: "1.4rem",
                                    cursor: "pointer",
                                    color: "red",
                                  }}
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p>@{post.userId.username}</p>
                          <p>{post.body}</p>
                          <div className={styles.singleCard__image}>
                            <img src={`${BASE_URL}/${post.media}`} alt="" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading...</h2>
        </DashboardLayout>
      </UserLayout>
    );
  }
};

export default Dashboard;
