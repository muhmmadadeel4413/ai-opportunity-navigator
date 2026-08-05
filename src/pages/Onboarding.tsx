import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  GraduationCap,
  Code2,
  Heart,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  X,
  Upload,
  User,
  File as FileIcon,
  Image as ImageIcon,
} from "lucide-react";

type Step = "name" | "education" | "skills" | "interests" | "resume" | "review";

interface FormData {
  full_name: string;
  education_level: string;
  university: string;
  major: string;
  gpa: string;
  graduation_year: string;
  technical_skills: string[];
  soft_skills: string[];
  interests: string[];
  career_goals: string;
  preferred_industry: string;
  location_preference: string;
  resume_text: string;
  resume_url: string;
}

const initialFormData: FormData = {
  full_name: "",
  education_level: "",
  university: "",
  major: "",
  gpa: "",
  graduation_year: "",
  technical_skills: [],
  soft_skills: [],
  interests: [],
  career_goals: "",
  preferred_industry: "",
  location_preference: "",
  resume_text: "",
  resume_url: "",
};

const educationLevels = [
  "High School",
  "Associate's",
  "Bachelor's",
  "Master's",
  "PhD",
  "Bootcamp",
  "Self-taught",
];

const skillSuggestions = [
  "Python",
  "JavaScript",
  "React",
  "SQL",
  "Java",
  "C++",
  "TypeScript",
  "Node.js",
  "AWS",
  "Docker",
  "Git",
  "Figma",
];

const softSkillSuggestions = [
  "Leadership",
  "Communication",
  "Teamwork",
  "Problem Solving",
  "Time Management",
  "Critical Thinking",
  "Adaptability",
  "Public Speaking",
  "Project Management",
];

const interestSuggestions = [
  "AI/ML",
  "Web Development",
  "Mobile Apps",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "Blockchain",
  "Sustainability",
  "Healthcare",
  "Finance",
  "Education",
  "Gaming",
  "Social Impact",
  "Entrepreneurship",
  "Design",
];

export function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("name");
  const [form, setForm] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [stepError, setStepError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps: { key: Step; label: string; icon: typeof GraduationCap }[] = [
    { key: "name", label: "Name", icon: User },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "skills", label: "Skills", icon: Code2 },
    { key: "interests", label: "Interests", icon: Heart },
    { key: "resume", label: "Resume", icon: FileText },
    { key: "review", label: "Review", icon: CheckCircle2 },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === step);

  const update = (field: keyof FormData, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addTag = (field: "technical_skills" | "soft_skills" | "interests") => {
    const trimmed = tagInput.trim();
    if (trimmed && !form[field].includes(trimmed)) {
      update(field, [...form[field], trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (
    field: "technical_skills" | "soft_skills" | "interests",
    tag: string
  ) => {
    update(
      field,
      form[field].filter((t) => t !== tag)
    );
  };

  const suggestTag = (
    field: "technical_skills" | "soft_skills" | "interests",
    tag: string
  ) => {
    if (!form[field].includes(tag)) {
      update(field, [...form[field], tag]);
    }
  };

  const handleResumeParse = async () => {
    if (!form.resume_text.trim()) return;
    setParsingResume(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const resp = await fetch(
        "https://bficpbbezccjpdifzxek.supabase.co/functions/v1/parse-resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ resume_text: form.resume_text }),
        }
      );
      const result = await resp.json();
      if (result.data) {
        const d = result.data;
        setForm((f) => ({
          ...f,
          full_name: d.full_name || f.full_name || "",
          education_level: d.education_level || f.education_level,
          university: d.university || f.university,
          major: d.major || f.major,
          gpa: d.gpa || f.gpa,
          graduation_year: d.graduation_year
            ? String(d.graduation_year)
            : f.graduation_year,
          technical_skills: [
            ...new Set([...f.technical_skills, ...(d.technical_skills || [])]),
          ],
          soft_skills: [
            ...new Set([...f.soft_skills, ...(d.soft_skills || [])]),
          ],
          interests: [
            ...new Set([...f.interests, ...(d.interests || [])]),
          ],
          career_goals: d.career_goals || f.career_goals,
          preferred_industry: d.preferred_industry || f.preferred_industry,
        }));
      }
    } catch {
      // Silent fail — user can fill manually
    }
    setParsingResume(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setStepError("Please upload a PDF, JPG, or PNG file.");
      return;
    }

    setUploadingResume(true);
    setStepError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const userId = session.user.id;
      const ext = file.name.split(".").pop() || "pdf";
      const filePath = `${userId}/resume.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      update("resume_url", urlData.publicUrl);

      // For PDFs, try to extract text using basic file reader
      if (file.type === "application/pdf") {
        const text = await file.text();
        if (text) {
          update("resume_text", text);
        }
      }
    } catch {
      setStepError("Failed to upload file. Please try again.");
    }
    setUploadingResume(false);

    // Reset the input so the same file can be re-uploaded
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateStep = (): boolean => {
    setStepError("");
    switch (step) {
      case "name":
        if (!form.full_name.trim()) {
          setStepError("Please enter your full name");
          return false;
        }
        return true;
      case "education":
        if (!form.education_level) {
          setStepError("Please select your education level");
          return false;
        }
        return true;
      case "skills":
        if (form.technical_skills.length === 0) {
          setStepError("Add at least one technical skill");
          return false;
        }
        return true;
      case "interests":
        if (form.interests.length === 0) {
          setStepError("Select at least one interest area");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    const next = steps[currentStepIdx + 1];
    if (next) setStep(next.key);
  };

  const prevStep = () => {
    const prev = steps[currentStepIdx - 1];
    if (prev) setStep(prev.key);
  };

  const handleFinish = async () => {
    if (!user) {
      setStepError("Session expired. Please sign in again.");
      setSaving(false);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: form.full_name.trim() || null,
        education_level: form.education_level || null,
        university: form.university || null,
        major: form.major || null,
        gpa: form.gpa || null,
        graduation_year: form.graduation_year
          ? parseInt(form.graduation_year)
          : null,
        technical_skills: form.technical_skills,
        soft_skills: form.soft_skills,
        interests: form.interests,
        career_goals: form.career_goals || null,
        preferred_industry: form.preferred_industry || null,
        location_preference: form.location_preference || null,
        resume_text: form.resume_text || null,
        resume_url: form.resume_url || null,
        onboarding_complete: true,
      });

    if (error) {
      setStepError("Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    await refreshProfile();
    navigate("/dashboard");
  };

  const TagPills = ({
    field,
    suggestions,
  }: {
    field: "technical_skills" | "soft_skills" | "interests";
    suggestions: string[];
  }) => (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {form[field].map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full"
          >
            {tag}
            <button
              onClick={() => removeTag(field, tag)}
              className="hover:text-destructive transition-colors cursor-pointer"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(field);
            }
          }}
          placeholder="Type and press Enter..."
          className="flex-1 px-4 py-2.5 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => addTag(field)}
          className="px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions
          .filter((s) => !form[field].includes(s))
          .slice(0, 8)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => suggestTag(field, s)}
              className="text-xs px-2.5 py-1 bg-muted text-foreground/70 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 cursor-pointer"
            >
              + {s}
            </button>
          ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case "name":
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );

      case "education":
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Education Level *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {educationLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => update("education_level", level)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      form.education_level === level
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-white text-foreground/70 hover:border-primary/30"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                University / School
              </label>
              <input
                type="text"
                value={form.university}
                onChange={(e) => update("university", e.target.value)}
                placeholder="e.g. University of California"
                className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Major / Field
                </label>
                <input
                  type="text"
                  value={form.major}
                  onChange={(e) => update("major", e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={form.graduation_year}
                  onChange={(e) => update("graduation_year", e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                GPA (optional)
              </label>
              <input
                type="text"
                value={form.gpa}
                onChange={(e) => update("gpa", e.target.value)}
                placeholder="e.g. 3.5"
                className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
              />
            </div>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Technical Skills *
              </label>
              <TagPills field="technical_skills" suggestions={skillSuggestions} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Soft Skills
              </label>
              <TagPills field="soft_skills" suggestions={softSkillSuggestions} />
            </div>
          </div>
        );

      case "interests":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Interest Areas *
              </label>
              <TagPills field="interests" suggestions={interestSuggestions} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Career Goals
              </label>
              <textarea
                value={form.career_goals}
                onChange={(e) => update("career_goals", e.target.value)}
                rows={3}
                placeholder="e.g. I want to become a full-stack developer at a mission-driven startup..."
                className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Preferred Industry
                </label>
                <input
                  type="text"
                  value={form.preferred_industry}
                  onChange={(e) => update("preferred_industry", e.target.value)}
                  placeholder="e.g. Tech, Healthcare"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Location Preference
                </label>
                <input
                  type="text"
                  value={form.location_preference}
                  onChange={(e) =>
                    update("location_preference", e.target.value)
                  }
                  placeholder="e.g. Remote, NYC"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );

      case "resume":
        return (
          <div className="space-y-4">
            <p className="text-sm text-foreground/60">
              Upload your resume as a file (PDF, JPG, or PNG) or paste the text
              below. We'll use AI to extract your education, skills, and
              interests — saving you time.
            </p>

            {/* File upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadingResume ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-sm text-foreground/60">
                    Uploading...
                  </span>
                </div>
              ) : form.resume_url ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    {form.resume_url.endsWith(".pdf") ? (
                      <FileIcon className="w-6 h-6 text-accent" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Resume uploaded
                  </span>
                  <span className="text-xs text-foreground/40">
                    Click to replace
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Click to upload your resume
                  </span>
                  <span className="text-xs text-foreground/40">
                    PDF, JPG or PNG
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-foreground/40 font-medium">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Paste text */}
            <textarea
              value={form.resume_text}
              onChange={(e) => update("resume_text", e.target.value)}
              rows={8}
              placeholder="Paste your resume text here..."
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200 resize-none"
            />
            <button
              type="button"
              onClick={handleResumeParse}
              disabled={!form.resume_text.trim() || parsingResume}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {parsingResume ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Parse with AI
                </>
              )}
            </button>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <p className="text-sm text-foreground/60 mb-4">
              Review your profile before we find your perfect matches. You can
              go back to edit any section.
            </p>
            <div className="space-y-3">
              <ReviewRow
                label="Full Name"
                value={form.full_name || "—"}
              />
              <ReviewRow
                label="Education"
                value={[
                  form.education_level,
                  form.university,
                  form.major,
                  form.graduation_year && `Class of ${form.graduation_year}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <ReviewRow
                label="Technical Skills"
                value={form.technical_skills.join(", ") || "None"}
              />
              <ReviewRow
                label="Soft Skills"
                value={form.soft_skills.join(", ") || "None"}
              />
              <ReviewRow
                label="Interests"
                value={form.interests.join(", ") || "None"}
              />
              <ReviewRow
                label="Career Goals"
                value={form.career_goals || "—"}
              />
              <ReviewRow
                label="Preferred Industry"
                value={form.preferred_industry || "—"}
              />
              <ReviewRow
                label="Location"
                value={form.location_preference || "—"}
              />
              <ReviewRow
                label="Resume"
                value={
                  form.resume_url
                    ? "File uploaded"
                    : form.resume_text
                    ? "Text pasted"
                    : "—"
                }
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < currentStepIdx;
            const active = i === currentStepIdx;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary text-on-primary"
                      : done
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-foreground/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-6 h-0.5 rounded ${
                      i < currentStepIdx ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content card */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
            {step === "name" && "What's your name?"}
            {step === "education" && "Tell us about your education"}
            {step === "skills" && "What skills do you bring?"}
            {step === "interests" && "What are you passionate about?"}
            {step === "resume" && "Upload your resume (optional)"}
            {step === "review" && "Review your profile"}
          </h2>

          {renderStep()}

          {stepError && (
            <div className="mt-4 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
              {stepError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {currentStepIdx > 0 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground rounded-xl hover:bg-muted transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}
            {step === "review" ? (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Find My Matches
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Skip hint */}
        {step !== "review" && (
          <p className="text-center text-sm text-foreground/40 mt-4">
            You can always update these later from your dashboard
          </p>
        )}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-3 border-b border-border last:border-0">
      <span className="text-sm font-semibold text-foreground sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground/70">{value}</span>
    </div>
  );
}
