import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  User,
  Mail,
  GraduationCap,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit3,
  FileText,
} from "lucide-react";

export default function ProfilePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <span className="text-accent font-heading font-bold text-2xl">
              {profile?.full_name?.charAt(0)?.toUpperCase() ||
                profile?.email?.charAt(0)?.toUpperCase() ||
                "?"}
            </span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground">
              {profile?.full_name || "Your Profile"}
            </h1>
            <p className="text-foreground/60">Manage your personal details</p>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
          Personal Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <User className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-foreground/50">Full Name</p>
              <p className="text-sm font-medium text-foreground">
                {profile?.full_name || "Not set"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <Mail className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-foreground/50">Email</p>
              <p className="text-sm font-medium text-foreground">
                {profile?.email || "Not set"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <GraduationCap className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-foreground/50">Education Level</p>
              <p className="text-sm font-medium text-foreground">
                {profile?.education_level || "Not set"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-foreground/50">Location Preference</p>
              <p className="text-sm font-medium text-foreground">
                {profile?.location_preference || "Anywhere"}
              </p>
            </div>
          </div>
          {profile?.graduation_year && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-foreground/50">Graduation Year</p>
                <p className="text-sm font-medium text-foreground">
                  {profile.graduation_year}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skills section */}
      {profile?.technical_skills && profile.technical_skills.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.technical_skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-primary/5 text-primary text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resume section */}
      {(profile?.resume_url || profile?.resume_text) && (
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
            Resume
          </h2>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-foreground/50">Resume File</p>
              {profile.resume_url ? (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View uploaded resume
                </a>
              ) : (
                <p className="text-sm font-medium text-foreground">
                  Resume text provided
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit button */}
      <button
        onClick={() => navigate("/onboarding")}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer w-full justify-center"
      >
        <Edit3 className="w-4 h-4" />
        Edit Profile
      </button>
    </div>
  );
}