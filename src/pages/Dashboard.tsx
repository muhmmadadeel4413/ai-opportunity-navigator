import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Sparkles, ArrowRight, User, MapPin, GraduationCap } from "lucide-react";

export function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  const handleFindMatches = async () => {
    setMatching(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const resp = await fetch(
        "https://bficpbbezccjpdifzxek.supabase.co/functions/v1/match-opportunities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ user_id: profile!.id, top_k: 10 }),
        }
      );
      const result = await resp.json();
      if (result.error) {
        setError(result.error);
        setMatching(false);
        return;
      }
      // Store matches in session storage for the matches page
      sessionStorage.setItem(
        "latest_matches",
        JSON.stringify(result.data || [])
      );
      navigate("/matches");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setMatching(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
          Hi{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}{" "}
          <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-foreground/60">
          Ready to discover your next opportunity? Let AI find the best matches
          for you.
        </p>
      </div>

      {/* Profile snapshot */}
      {profile && (
        <div className="bg-white border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
            Your Profile Snapshot
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <GraduationCap className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-foreground/50">Education</p>
                <p className="text-sm font-medium text-foreground">
                  {profile.education_level || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-foreground/50">Major</p>
                <p className="text-sm font-medium text-foreground">
                  {profile.major || profile.university || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-foreground/50">Location Preference</p>
                <p className="text-sm font-medium text-foreground">
                  {profile.location_preference || "Anywhere"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main CTA card */}
      <div className="bg-white border border-border rounded-2xl p-8 md:p-10 shadow-sm">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
            Find Your Matches
          </h2>
          <p className="text-foreground/60 mb-8">
            Our AI analyzes your profile against hundreds of opportunities —
            internships, scholarships, hackathons, and more. Get personalized
            matches with explanations of why each one fits you.
          </p>

          {error && (
            <div className="mb-4 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleFindMatches}
            disabled={matching}
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold text-lg rounded-2xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            {matching ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Finding matches...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Find My Matches
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Empty state for new users */}
      <div className="mt-6 text-center">
        <p className="text-sm text-foreground/40">
          Want to update your profile?{" "}
          <button
            onClick={() => navigate("/onboarding")}
            className="text-primary hover:underline cursor-pointer font-medium"
          >
            Edit your preferences
          </button>
        </p>
      </div>
    </div>
  );
}
