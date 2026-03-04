import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";

export const NavBarComponent = () => {
  const router = useRouter();
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
          <div
            onClick={() => {
              router.push("/login");
            }}
            className={styles.buttonJoin}
          >
            Be a part
          </div>
        </div>
      </nav>
    </div>
  );
};
