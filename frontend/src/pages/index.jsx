import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
export default function Home() {
  const router = useRouter();
  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer__Left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>A True social media platform, with stories no blufs !</p>
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              <p>Join Now</p>
            </div>
          </div>
          <div className={styles.mainContainer__Right}>
            <img src="images/homemain_connection.avif" alt="" />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
