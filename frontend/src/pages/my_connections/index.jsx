import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect } from "react";
import styles from "./connection.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptConnection,
  getMyConnectionsRequests,
} from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

const MyConnectionsPage = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const pendingRequests = authState.connectionRequest.filter(
    (connection) => connection.status_accepted === null,
  );
  const acceptedConnections = authState.connectionRequest.filter(
    (connection) => connection.status_accepted === true,
  );

  useEffect(() => {
    dispatch(
      getMyConnectionsRequests({ token: localStorage.getItem("token") }),
    );
  }, [dispatch]);
  return (
    <UserLayout>
      <DashboardLayout>
        <>
          <div className={styles.myConnections__section}>
            <p className={styles.heading}>My Connections</p>
            {pendingRequests.length === 0 && (
              <div className={styles.empty__connections}>
                <p>No Connection Requests pending !</p>
              </div>
            )}
            {pendingRequests.map((user) => {
              return (
                <div
                  onClick={() => {
                    router.push(`/view_profile/${user.userId.username}`);
                  }}
                  className={styles.userCard}
                  key={user._id}
                >
                  <div className={styles.userCard__details}>
                    <div className={styles.userCard__profilePicture}>
                      <img
                        src={`${BASE_URL}/${user.userId.profilePicture}`}
                        alt=""
                      />
                    </div>
                    <div className={styles.userCard__info}>
                      <p className={styles.userCard__name}>
                        {user.userId.name}
                      </p>
                      <p className={styles.userCard__userName}>
                        @{user.userId.username}
                      </p>
                    </div>
                    <div className={styles.accept_Btn}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            acceptConnection({
                              connectionId: user._id,
                              token: localStorage.getItem("token"),
                              action: "accept",
                            }),
                          );
                        }}
                      >
                        ACCEPT
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.myNetwork__section}>
            <p className={styles.heading}>My Networks</p>
            {acceptedConnections.map((user) => {
              return (
                <div
                  onClick={() => {
                    router.push(`/view_profile/${user.userId.username}`);
                  }}
                  className={styles.userCard}
                  key={user._id}
                >
                  <div className={styles.userCard__details}>
                    <div className={styles.userCard__profilePicture}>
                      <img
                        src={`${BASE_URL}/${user.userId.profilePicture}`}
                        alt=""
                      />
                    </div>
                    <div className={styles.userCard__info}>
                      <p className={styles.userCard__name}>{user.userId.name}</p>
                      <p className={styles.userCard__userName}>
                        @{user.userId.username}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      </DashboardLayout>
    </UserLayout>
  );
};

export default MyConnectionsPage;
