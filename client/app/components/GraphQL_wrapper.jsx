"use client";
import { getDataFromLocal, removeDataFromLocal } from "@/utils/localStorage";
import { gql, useLazyQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logOut, setToken, setUser } from "../redux/globalSlice";

const GraphQL_wrapper = ({ children }) => {
  const [token, settoken] = useState(null);
  const [jwt_token, setJwt_Token] = useState(token);
  const router = useRouter();
  const tokenizedSignInGql = gql`
    query TokenizedSignIn {
      tokenizedSignIn
    }
  `;
  const dispatch = useDispatch();
  const [refetch, { loading, error, data: isTokenValid }] = useLazyQuery(
    tokenizedSignInGql,
    {
      context: {
        headers: {
          authorization: `Bearer ${jwt_token}`,
        },
      },
    }
  );
  // if (!data?.tokenizedSignIn || !jwt_token) {
  //   removeDataFromLocal("token");
  //   return router.push("/login");
  // }
  useEffect(() => {
    const { token } = getDataFromLocal("token");
    settoken(token);
    setJwt_Token(token);
  }, []);
  useEffect(() => {
    if (token) {
      console.log("lol token", token);
      setJwt_Token(token);
      refetch();
    }
  }, [jwt_token]);
  console.log("isTokenValid", isTokenValid);
  useEffect(() => {
    if (token && jwt_token && isTokenValid?.tokenizedSignIn == "invalid") {
      const notify = () => toast.success("Invalid Token");
      notify();
      dispatch(logOut());
      removeDataFromLocal("token");
      removeDataFromLocal("user");
      router.push("/");
      return;
    } else {
      const user = getDataFromLocal("user");
      if (user) {
        dispatch(setUser(user));
        dispatch(setToken({ token }));
      }
    }
  }, [isTokenValid]);
  return children;
};

export default GraphQL_wrapper;