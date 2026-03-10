import { clientServer } from "@/config";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const ViewProfilePage = ({ userProfile }) => {
  const searchParameters = useSearchParams();
  useEffect(() => {});

  return <div>{userProfile.userId.name}</div>;
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
