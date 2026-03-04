import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import UserLayout from "@/layout/UserLayout";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

const LoginComponent = () => {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [userLoginMethod, setUserLoginMethod] = useState(false);

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  });

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer__left}>
            <p className={styles.cardleft__heading}>
              {userLoginMethod ? "Sign In" : "Sign up"}
            </p>
            <div className={styles.inputContainers}>
              <div className={styles.inputRow}>
                <input
                  className={styles.inputField}
                  type="text"
                  placeholder="Name"
                />
                <input
                  className={styles.inputField}
                  type="text"
                  placeholder="Username"
                />
              </div>
              <input
                className={styles.inputField}
                type="email"
                placeholder="Email"
              />
              <input
                className={styles.inputField}
                type="password"
                placeholder="Password"
              />

              <div className={styles.buttonWithOutline}>
                <p>{userLoginMethod ? "Sign In" : "Sign Up"}</p>
              </div>
            </div>
          </div>
          <div className={styles.cardContainer__right}></div>
        </div>
      </div>
    </UserLayout>
  );
};

export default LoginComponent;
