import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import {
  createPost,
  getAllPosts,
  deletePost,
  incrementPostLike,
  getAllComments,
  postComment,
} from "@/config/redux/action/postAction";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "./dash.module.css";
import { BASE_URL } from "@/config";
import { resetPostId } from "@/config/redux/reducer/postReducer";

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
  const [commentText, setCommentText] = useState("");

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
                          <div className={styles.optionsContainer}>
                            <div
                              className={styles.singleOption__optionsContainer}
                              onClick={async () => {
                                await dispatch(
                                  incrementPostLike({ post_id: post._id }),
                                );
                                dispatch(getAllPosts());
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6"
                              >
                                <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
                              </svg>
                              <p>{post.likes}</p>
                            </div>
                            <div
                              className={styles.singleOption__optionsContainer}
                              onClick={() => {
                                dispatch(getAllComments({ post_id: post._id }));
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div
                              className={styles.singleOption__optionsContainer}
                              onClick={() => {
                                const text = encodeURIComponent(post.body);
                                const url = encodeURIComponent(
                                  "https://www.linkedin.com/in/mayank-kumar-anand/",
                                );
                                const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                                window.open(twitterUrl, "_blank");
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {postState.postId !== "" && (
            <div
              className={styles.commentsContainer}
              onClick={() => {
                dispatch(resetPostId());
              }}
            >
              <div
                className={styles.allCommentsContainer}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {postState.comments.length === 0 && <h2>No Comments</h2>}
                {postState.comments.length !== 0 && (
                  <div>
                    {postState.comments.map((comment, index) => {
                      return (
                        <div className={styles.singleComment} key={comment._id}>
                          <div
                            className={styles.singleComment__profileContainer}
                          >
                            <img
                              src={`${BASE_URL}/${profilePicture}`}
                              alt=""
                              className={styles.singleComment__profilePic}
                            />

                            <div className={styles.singleComment__body}>
                              <p>{comment.userId.name}</p>
                              <p>@{comment.userId.username}</p>
                              <p>{comment.body}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className={styles.postCommentContainer}>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Comment"
                  />
                  <div
                    className={styles.postCommentContainer__commentBtn}
                    onClick={async () => {
                      await dispatch(
                        postComment({
                          post_id: postState.postId,
                          body: commentText,
                        }),
                      );
                      await dispatch(
                        getAllComments({ post_id: postState.postId }),
                      );
                    }}
                  >
                    <p>POST</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
