import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import ChatAi from "./Chat_Ai";

export default function Guide() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <Header />
      <main className="flex-1 mb-20 flex flex-col overflow-hidden">
        <ChatAi />
      </main>
      <BottomNav />
    </div>
  );
}
