import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const hasUser = !!localStorage.getItem("sarthi.user");
    navigate(hasUser ? "/home" : "/onboarding", { replace: true });
  }, [navigate]);
  return null;
}
