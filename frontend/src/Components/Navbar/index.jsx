import React, { useState } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

export const NavBarComponent = () => {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <h1
          onClick={() => {
            router.push("/");
          }}
          style={{ cursor: "pointer" }}
        >
          Pro Connect
        </h1>
        <div className={styles.navBarOptionContainer}>
          {authState.profileFetched && (
            <div>
              <div className={styles.navbarProfile}>
                <p>Hey, {authState.user.userId.name}</p>
                <p>Profile</p>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/login");
                    dispatch(reset());
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          )}

          {!authState.profileFetched && (
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              Be a part
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
