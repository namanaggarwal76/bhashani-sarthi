import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MapPin, Award, Target, Languages } from "lucide-react";
import { updateUserProfile } from "@/lib/firestore-service";

export default function Profile() {
  const { user, refreshUser } = useUser();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState(user?.basic_info.name || "");
  const [age, setAge] = useState(user?.basic_info.age || 0);
  const [country, setCountry] = useState(user?.basic_info.country || "");
  const [language, setLanguage] = useState(user?.basic_info.language.name || "");
  const [interests, setInterests] = useState(user?.preferences.interests.join(", ") || "");
  const [travelStyle, setTravelStyle] = useState(user?.preferences.travel_style || "");
  const [budget, setBudget] = useState(user?.preferences.budget || "");

  if (!user) return null;

  const handleEdit = () => {
    setName(user.basic_info.name);
    setAge(user.basic_info.age);
    setCountry(user.basic_info.country);
    setLanguage(user.basic_info.language.name);
    setInterests(user.preferences.interests.join(", "));
    setTravelStyle(user.preferences.travel_style);
    setBudget(user.preferences.budget);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        basic_info: {
          name,
          email: user.basic_info.email,
          age,
          country,
          language: {
            code: user.basic_info.language.code,
            name: language,
          },
        },
        preferences: {
          interests: interests.split(",").map(i => i.trim()).filter(Boolean),
          travel_style: travelStyle,
          budget,
        },
      });

      await refreshUser();
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src="https://avatar.iran.liara.run/public"
            alt="Profile"
            className="h-10 w-10 rounded-full border-2 border-primary"
          />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("profile.title") || "Profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Picture and Stats */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <img
              src="https://avatar.iran.liara.run/public"
              alt="Profile"
              className="h-20 w-20 rounded-full border-4 border-primary"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold">{user.basic_info.name}</h3>
              <p className="text-sm text-muted-foreground">{user.basic_info.email}</p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{user.stats.tier}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{user.stats.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Chapters Completed</span>
              </div>
              <p className="text-2xl font-bold">{user.stats.chapters_created}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Places Visited</span>
              </div>
              <p className="text-2xl font-bold">{user.stats.places_visited}</p>
            </div>
          </div>

          {/* Profile Details */}
          {!editing ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{user.basic_info.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{user.basic_info.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium">{user.basic_info.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Language:</span>
                    <span className="font-medium">{user.basic_info.language.name}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Travel Preferences</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interests:</span>
                    <span className="font-medium">{user.preferences.interests.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Travel Style:</span>
                    <span className="font-medium">{user.preferences.travel_style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{user.preferences.budget}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleEdit} className="w-full">
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Basic Information</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      placeholder="Your age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Your country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Preferred Language</Label>
                    <Input
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="e.g., English, Hindi"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Travel Preferences</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="interests">Interests (comma separated)</Label>
                    <Input
                      id="interests"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="e.g., food, monuments, nature"
                    />
                  </div>
                  <div>
                    <Label htmlFor="travelStyle">Travel Style</Label>
                    <Input
                      id="travelStyle"
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      placeholder="e.g., adventurous, relaxed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., low, moderate, high"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditing(false)}
                  className="flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
