import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import styles from "./profile.module.css";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL, clientServer } from "@/config";
import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import { deletePost, getAllPosts } from "@/config/redux/action/postAction";
import { reset } from "@/config/redux/reducer/authReducer";
import { useRouter } from "next/router";

const PROFILE_SECTION_TEMPLATES = {
  pastWork: {
    company: "",
    position: "",
    years: "",
  },
  education: {
    school: "",
    degree: "",
    fieldOfStudy: "",
  },
};

const COLLECTION_FIELDS = {
  pastWork: ["company", "position", "years"],
  education: ["school", "degree", "fieldOfStudy"],
};

const sanitizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeCollectionItems = (items, section) =>
  (items ?? [])
    .map((item) => {
      const normalizedItem = COLLECTION_FIELDS[section].reduce(
        (accumulator, field) => ({
          ...accumulator,
          [field]: sanitizeTextValue(item?.[field]),
        }),
        item?._id ? { _id: item._id } : {},
      );

      return normalizedItem;
    })
    .filter((item) =>
      COLLECTION_FIELDS[section].some((field) => item[field] !== ""),
    );

const ProfilePage = () => {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.posts);
  const dispatch = useDispatch();
  const [draftProfile, setDraftProfile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState("");
  const originalProfile = authState.user;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    dispatch(getAboutUser({ token }));
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    setDraftProfile(authState.user);
  }, [authState.user]);

  const profileUser = draftProfile?.userId;
  const profileName = profileUser?.name ?? "";
  const profileBio = draftProfile?.bio ?? "";
  const userPosts = postState.posts.filter(
    (post) => post.userId?._id === profileUser?._id,
  );
  const pastWork = draftProfile?.pastWork ?? [];
  const education = draftProfile?.education ?? [];
  const sanitizedBio = sanitizeTextValue(profileBio);
  const sanitizedPastWork = sanitizeCollectionItems(pastWork, "pastWork");
  const sanitizedEducation = sanitizeCollectionItems(education, "education");
  const hasNameChanged = profileName !== (originalProfile?.userId?.name ?? "");
  const hasProfileFieldsChanged =
    JSON.stringify({
      bio: sanitizedBio,
      pastWork: sanitizedPastWork,
      education: sanitizedEducation,
    }) !==
    JSON.stringify({
      bio: sanitizeTextValue(originalProfile?.bio ?? ""),
      pastWork: sanitizeCollectionItems(
        originalProfile?.pastWork ?? [],
        "pastWork",
      ),
      education: sanitizeCollectionItems(
        originalProfile?.education ?? [],
        "education",
      ),
    });
  const hasPendingChanges =
    Boolean(draftProfile) && (hasNameChanged || hasProfileFieldsChanged);

  if (!profileUser) {
    return (
      <UserLayout>
        <DashboardLayout />
      </UserLayout>
    );
  }

  const updateProfilePicture = async (file) => {
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", token);

    await clientServer.post("/update_profile_picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    await Promise.all([
      dispatch(getAboutUser({ token })),
      dispatch(getAllUsers()),
      dispatch(getAllPosts()),
    ]);
  };

  const updateProfileData = (profileUpdater) => {
    setDraftProfile((currentProfile) => {
      if (!currentProfile) return currentProfile;

      return profileUpdater(currentProfile);
    });
  };

  const updateCollectionItem = (section, index, field, value) => {
    updateProfileData((currentProfile) => ({
      ...currentProfile,
      [section]: (currentProfile[section] ?? []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addCollectionItem = (section) => {
    updateProfileData((currentProfile) => ({
      ...currentProfile,
      [section]: [
        ...(currentProfile[section] ?? []),
        { ...PROFILE_SECTION_TEMPLATES[section] },
      ],
    }));
  };

  const removeCollectionItem = (section, index) => {
    updateProfileData((currentProfile) => ({
      ...currentProfile,
      [section]: (currentProfile[section] ?? []).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const saveProfileChanges = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profileUser || !hasPendingChanges) return;

    try {
      setIsSavingProfile(true);
      const requests = [];

      if (hasNameChanged) {
        requests.push(
          clientServer.post("/user_update", {
            token,
            name: profileName,
          }),
        );
      }

      if (hasProfileFieldsChanged) {
        requests.push(
          clientServer.post("/update_profile_data", {
            token,
            bio: sanitizedBio,
            pastWork: sanitizedPastWork,
            education: sanitizedEducation,
          }),
        );
      }

      await Promise.all(requests);
      await Promise.all([
        dispatch(getAboutUser({ token })),
        dispatch(getAllUsers()),
        dispatch(getAllPosts()),
      ]);
    } catch (error) {
      console.error("Unable to update profile", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const deleteUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const shouldDelete = window.confirm(
      "Delete your profile, posts, comments, and connections permanently?",
    );

    if (!shouldDelete) return;

    try {
      setIsDeletingProfile(true);
      await clientServer.delete("/delete_profile", {
        data: { token },
      });
      localStorage.removeItem("token");
      dispatch(reset());
      router.replace("/login");
    } catch (error) {
      console.error("Unable to delete profile", error);
    } finally {
      setIsDeletingProfile(false);
    }
  };

  const deleteUserPost = async (postId) => {
    const shouldDelete = window.confirm(
      "Delete this post permanently from your profile?",
    );

    if (!shouldDelete) return;

    try {
      setDeletingPostId(postId);
      await dispatch(deletePost({ post_id: postId }));
      await dispatch(getAllPosts());
    } catch (error) {
      console.error("Unable to delete post", error);
    } finally {
      setDeletingPostId("");
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <label
              className={styles.backDrop__overlay}
              htmlFor="profilePictureUpload"
            >
              <p>
                <i className="fa-regular fa-pen-to-square"></i>&nbsp;Edit
              </p>
            </label>
            <input
              type="file"
              id="profilePictureUpload"
              hidden
              onChange={(e) => {
                updateProfilePicture(e.target.files[0]);
              }}
            />
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
                  <input
                    type="text"
                    className={styles.name__edit}
                    value={profileName}
                    size={Math.max(profileName.length, 1)}
                    onChange={(e) => {
                      updateProfileData((currentProfile) => ({
                        ...currentProfile,
                        userId: {
                          ...currentProfile.userId,
                          name: e.target.value,
                        },
                      }));
                    }}
                  />

                  <p className={styles.profile__username}>
                    @{profileUser.username}
                  </p>
                </div>

                <div className={styles.profileEditor}>
                  <label className={styles.fieldLabel} htmlFor="profileBio">
                    <p className={styles.bio__heading}>Bio</p>
                  </label>
                  <textarea
                    id="profileBio"
                    className={styles.profileTextarea}
                    rows={Math.max(3, Math.ceil(profileBio.length / 80))}
                    placeholder="Write a short introduction about yourself."
                    value={profileBio}
                    onChange={(e) => {
                      updateProfileData((currentProfile) => ({
                        ...currentProfile,
                        bio: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className={styles.profileDetails__rightBar}>
                <p className={styles.recentActivity__heading}>Recent 's</p>
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
          <div className={styles.editorSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.workHistory__title}>Work History</p>
                <p className={styles.sectionSubtitle}>
                  Add and refine the roles you want to highlight.
                </p>
              </div>
              <button
                type="button"
                className={styles.sectionAction}
                onClick={() => addCollectionItem("pastWork")}
              >
                Add Work
              </button>
            </div>

            {pastWork.length === 0 ? (
              <div className={styles.emptyState}>
                No work history yet. Add your first experience.
              </div>
            ) : (
              <div className={styles.editorGrid}>
                {pastWork.map((work, index) => {
                  return (
                    <div
                      key={work._id ?? `work-${index}`}
                      className={styles.editorCard}
                    >
                      <div className={styles.editorCardHeader}>
                        <p className={styles.editorCardTitle}>
                          Work #{index + 1}
                        </p>
                        <button
                          type="button"
                          className={styles.deleteAction}
                          onClick={() =>
                            removeCollectionItem("pastWork", index)
                          }
                        >
                          Delete
                        </button>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label
                          className={styles.fieldLabel}
                          htmlFor={`company-${index}`}
                        >
                          Company
                        </label>
                        <input
                          id={`company-${index}`}
                          type="text"
                          className={styles.fieldInput}
                          value={work.company ?? ""}
                          onChange={(e) => {
                            updateCollectionItem(
                              "pastWork",
                              index,
                              "company",
                              e.target.value,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label
                          className={styles.fieldLabel}
                          htmlFor={`position-${index}`}
                        >
                          Position
                        </label>
                        <input
                          id={`position-${index}`}
                          type="text"
                          className={styles.fieldInput}
                          value={work.position ?? ""}
                          onChange={(e) => {
                            updateCollectionItem(
                              "pastWork",
                              index,
                              "position",
                              e.target.value,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label
                          className={styles.fieldLabel}
                          htmlFor={`years-${index}`}
                        >
                          Duration
                        </label>
                        <input
                          id={`years-${index}`}
                          type="text"
                          className={styles.fieldInput}
                          value={work.years ?? ""}
                          placeholder="e.g. 2 years"
                          onChange={(e) => {
                            updateCollectionItem(
                              "pastWork",
                              index,
                              "years",
                              e.target.value,
                            );
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.editorSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.workHistory__title}>Education</p>
                <p className={styles.sectionSubtitle}>
                  Capture the schools and programs that shaped your journey.
                </p>
              </div>
              <button
                type="button"
                className={styles.sectionAction}
                onClick={() => addCollectionItem("education")}
              >
                Add Education
              </button>
            </div>

            {education.length === 0 ? (
              <div className={styles.emptyState}>
                No education added yet. Start with your latest course or degree.
              </div>
            ) : (
              <div className={styles.editorGrid}>
                {education.map((entry, index) => {
                  return (
                    <div
                      key={entry._id ?? `education-${index}`}
                      className={styles.editorCard}
                    >
                      <div className={styles.editorCardHeader}>
                        <p className={styles.editorCardTitle}>
                          Education #{index + 1}
                        </p>
                        <button
                          type="button"
                          className={styles.deleteAction}
                          onClick={() =>
                            removeCollectionItem("education", index)
                          }
                        >
                          Delete
                        </button>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label
                          className={styles.fieldLabel}
                          htmlFor={`school-${index}`}
                        >
                          School
                        </label>
                        <input
                          id={`school-${index}`}
                          type="text"
                          className={styles.fieldInput}
                          value={entry.school ?? ""}
                          onChange={(e) => {
                            updateCollectionItem(
                              "education",
                              index,
                              "school",
                              e.target.value,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label
                          className={styles.fieldLabel}
                          htmlFor={`degree-${index}`}
                        >
                          Degree
                        </label>
                        <input
                          id={`degree-${index}`}
                          type="text"
                          className={styles.fieldInput}
                          value={entry.degree ?? ""}
                          onChange={(e) => {
                            updateCollectionItem(
                              "education",
                              index,
                              "degree",
                              e.target.value,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label
                          className={styles.fieldLabel}
                          htmlFor={`field-${index}`}
                        >
                          Field Of Study
                        </label>
                        <input
                          id={`field-${index}`}
                          type="text"
                          className={styles.fieldInput}
                          value={entry.fieldOfStudy ?? ""}
                          onChange={(e) => {
                            updateCollectionItem(
                              "education",
                              index,
                              "fieldOfStudy",
                              e.target.value,
                            );
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.editorSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.workHistory__title}>Your Posts</p>
                <p className={styles.sectionSubtitle}>
                  All posts you have shared on the platform.
                </p>
              </div>
            </div>

            {userPosts.length === 0 ? (
              <div className={styles.emptyState}>
                You have not posted anything yet.
              </div>
            ) : (
              <div className={styles.postsGrid}>
                {userPosts.map((post) => {
                  return (
                    <div key={post._id} className={styles.postCardLarge}>
                      <button
                        type="button"
                        className={styles.postDeleteAction}
                        onClick={() => deleteUserPost(post._id)}
                        disabled={deletingPostId === post._id}
                      >
                        {deletingPostId === post._id ? "Deleting..." : "Delete"}
                      </button>
                      {post.media !== "" && (
                        <img
                          className={styles.postCardLarge__media}
                          src={`${BASE_URL}/${post.media}`}
                          alt="Post media"
                        />
                      )}
                      <p className={styles.postCardLarge__body}>{post.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.profileActions}>
            {hasPendingChanges && (
              <button
                type="button"
                className={styles.connection__Btn}
                onClick={saveProfileChanges}
                disabled={isSavingProfile || isDeletingProfile}
              >
                {isSavingProfile ? "Updating..." : "Update Profile"}
              </button>
            )}

            <button
              type="button"
              className={styles.deleteProfileBtn}
              onClick={deleteUserProfile}
              disabled={isDeletingProfile || isSavingProfile}
            >
              {isDeletingProfile ? "Deleting..." : "Delete Profile"}
            </button>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
};

export default ProfilePage;
