import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";

export default function Translate() {
  const { t } = useUser();
  return (
  <div className="min-h-screen pb-28 bg-transparent">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("translate")}</h1>
          <p className="text-gray-900">Instantly translate text between languages.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <Textarea placeholder="Enter text to translate..." className="h-36 text-base" />
          <Textarea placeholder="Translation..." readOnly className="h-36 bg-gray-100/60 text-base" />
        </div>
        <div className="flex justify-center items-center gap-4">
            <Button variant="outline">English</Button>
            <ArrowRightLeft className="h-6 w-6 text-gray-900" />
            <Button variant="outline">Hindi</Button>
            <Button>Translate</Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}