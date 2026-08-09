import { useRef, useState } from "react";
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
} from "lucide-react";

type Step =
  | "name"
  | "education"
  | "skills"
  | "interests"
  | "resume"
  | "review";

type TagField = "technical_skills" | "soft_skills" | "interests";

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
  const [uploadingResume, setUploadingResume] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [stepError, setStepError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps: Array<{
    key: Step;
    label: string;
    icon: typeof GraduationCap;
  }> = [
    { key: "name", label: "Name", icon: User },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "skills", label: "Skills", icon: Code2 },
    { key: "interests", label: "Interests", icon: Heart },
    { key: "resume", label: "Resume", icon: FileText },
    { key: "review", label: "Review", icon: CheckCircle2 },
  ];

  const currentStepIdx = steps.findIndex((item) => item.key === step);

  const update = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addTag = (field: TagField) => {
    const trimmed = tagInput.trim();

    if (!trimmed) {
      return;
    }

    if (!form[field].includes(trimmed)) {
      update(field, [...form[field], trimmed]);
    }

    setTagInput("");
  };

  const removeTag = (field: TagField, tag: string) => {
    update(
      field,
      form[field].filter((item) => item !== tag)
    );
  };

  const suggestTag = (field: TagField, tag: string) => {
    if (!form[field].includes(tag)) {
      update(field, [...form[field], tag]);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setStepError("Please upload a PDF resume only.");
      event.target.value = "";
      return;
    }

    setUploadingResume(true);
    setStepError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session.");
      }

      const userId = session.user.id;
      const filePath = `${userId}/resume.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Could not create resume URL.");
      }

      update("resume_url", urlData.publicUrl);
      update("resume_text", "");
    } catch (error) {
      console.error("Resume upload error:", error);
      setStepError("Failed to upload resume. Please try again.");
    } finally {
      setUploadingResume(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const validateStep = (): boolean => {
    setStepError("");

    switch (step) {
      case "name":
        if (!form.full_name.trim()) {
          setStepError("Please enter your full name.");
          return false;
        }
        return true;

      case "education":
        if (!form.education_level) {
          setStepError("Please select your education level.");
          return false;
        }
        return true;

      case "skills":
        if (form.technical_skills.length === 0) {
          setStepError("Add at least one technical skill.");
          return false;
        }
        return true;

      case "interests":
        if (form.interests.length === 0) {
          setStepError("Select at least one interest area.");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    const next = steps[currentStepIdx + 1];

    if (next) {
      setStep(next.key);
    }
  };

  const prevStep = () => {
    const previous = steps[currentStepIdx - 1];

    if (previous) {
      setStep(previous.key);
    }
  };

  const handleFinish = async () => {
    if (!user) {
      setStepError("Session expired. Please sign in again.");
      return;
    }

    setSaving(true);
    setStepError("");

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email ?? null,

        full_name: form.full_name.trim() || null,
        education_level: form.education_level || null,
        university: form.university.trim() || null,
        major: form.major.trim() || null,
        gpa: form.gpa.trim() || null,

        graduation_year: form.graduation_year
          ? Number(form.graduation_year)
          : null,

        technical_skills: form.technical_skills,
        soft_skills: form.soft_skills,
        interests: form.interests,

        career_goals: form.career_goals.trim() || null,
        preferred_industry:
          form.preferred_industry.trim() || null,
        location_preference:
          form.location_preference.trim() || null,

        resume_text: null,
        resume_url: form.resume_url || null,

        onboarding_complete: true,
      });

      if (error) {
        throw error;
      }

      await refreshProfile();
      navigate("/dashboard");
    } catch (error) {
      console.error("Profile save error:", error);
      setStepError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const TagPills = ({
    field,
    suggestions,
  }: {
    field: TagField;
    suggestions: string[];
  }) => {
    return (
      <div className="space-y-3">
        {form[field].length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form[field].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
              >
                {tag}

                <button
                  type="button"
                  onClick={() => removeTag(field, tag)}
                  className="cursor-pointer transition-colors hover:text-destructive"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(event) =>
              setTagInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag(field);
              }
            }}
            placeholder="Type and press Enter..."
            className="flex-1 rounded-xl border-2 border-border bg-white px-4 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
          />

          <button
            type="button"
            onClick={() => addTag(field)}
            className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            aria-label="Add skill"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions
            .filter((suggestion) => !form[field].includes(suggestion))
            .slice(0, 8)
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  suggestTag(field, suggestion)
                }
                className="cursor-pointer rounded-full bg-muted px-2.5 py-1 text-xs text-foreground/70 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
              >
                + {suggestion}
              </button>
            ))}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case "name":
        return (
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Full Name *
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/30" />

              <input
                type="text"
                value={form.full_name}
                onChange={(event) =>
                  update("full_name", event.target.value)
                }
                placeholder="e.g. Jane Doe"
                className="w-full rounded-xl border-2 border-border bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
              />
            </div>
          </div>
        );

      case "education":
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Education Level *
              </label>

              <div className="grid grid-cols-2 gap-2">
                {educationLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      update("education_level", level)
                    }
                    className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
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
              <label className="mb-2 block text-sm font-semibold text-foreground">
                University / School
              </label>

              <input
                type="text"
                value={form.university}
                onChange={(event) =>
                  update("university", event.target.value)
                }
                placeholder="e.g. University of California"
                className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Major / Field
                </label>

                <input
                  type="text"
                  value={form.major}
                  onChange={(event) =>
                    update("major", event.target.value)
                  }
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Graduation Year
                </label>

                <input
                  type="number"
                  value={form.graduation_year}
                  onChange={(event) =>
                    update(
                      "graduation_year",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 2026"
                  className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                GPA (optional)
              </label>

              <input
                type="text"
                value={form.gpa}
                onChange={(event) =>
                  update("gpa", event.target.value)
                }
                placeholder="e.g. 3.5"
                className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
              />
            </div>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Technical Skills *
              </label>

              <TagPills
                field="technical_skills"
                suggestions={skillSuggestions}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Soft Skills
              </label>

              <TagPills
                field="soft_skills"
                suggestions={softSkillSuggestions}
              />
            </div>
          </div>
        );

      case "interests":
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Interest Areas *
              </label>

              <TagPills
                field="interests"
                suggestions={interestSuggestions}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Career Goals
              </label>

              <textarea
                value={form.career_goals}
                onChange={(event) =>
                  update("career_goals", event.target.value)
                }
                rows={3}
                placeholder="e.g. I want to become a full-stack developer at a mission-driven startup..."
                className="w-full resize-none rounded-xl border-2 border-border bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Preferred Industry
                </label>

                <input
                  type="text"
                  value={form.preferred_industry}
                  onChange={(event) =>
                    update(
                      "preferred_industry",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Tech, Healthcare"
                  className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Location Preference
                </label>

                <input
                  type="text"
                  value={form.location_preference}
                  onChange={(event) =>
                    update(
                      "location_preference",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Remote, NYC"
                  className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20"
                />
              </div>
            </div>
          </div>
        );

      case "resume":
        return (
          <div className="space-y-4">
            <p className="text-sm text-foreground/60">
              Upload your resume as a PDF. Your profile
              information has already been entered manually. The
              resume will only be stored as a file and will not
              automatically change your profile.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-all duration-200 hover:border-primary/40 hover:bg-primary/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadingResume ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

                  <span className="text-sm text-foreground/60">
                    Uploading resume...
                  </span>
                </div>
              ) : form.resume_url ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <FileIcon className="h-6 w-6 text-accent" />
                  </div>

                  <span className="text-sm font-medium text-foreground">
                    Resume uploaded successfully
                  </span>

                  <span className="text-xs text-foreground/40">
                    Click to replace the PDF
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>

                  <span className="text-sm font-medium text-foreground">
                    Click to upload your resume
                  </span>

                  <span className="text-xs text-foreground/40">
                    PDF files only
                  </span>
                </div>
              )}
            </div>

            {form.resume_url && (
              <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
                <CheckCircle2 className="h-4 w-4" />
                Your PDF resume is ready.
              </div>
            )}
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <p className="mb-4 text-sm text-foreground/60">
              Review your profile before we find your perfect
              matches. You can go back to edit any section.
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
                  form.graduation_year &&
                    `Class of ${form.graduation_year}`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              />

              <ReviewRow
                label="Technical Skills"
                value={
                  form.technical_skills.join(", ") || "None"
                }
              />

              <ReviewRow
                label="Soft Skills"
                value={
                  form.soft_skills.join(", ") || "None"
                }
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
                    ? "PDF uploaded"
                    : "No resume uploaded"
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const done = index < currentStepIdx;
            const active = index === currentStepIdx;

            return (
              <div
                key={item.key}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary text-on-primary"
                    : done
                    ? "bg-accent/10 text-accent"
                    : "bg-muted text-foreground/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />

                {item.label}

                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-6 rounded ${
                      index < currentStepIdx
                        ? "bg-accent"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-heading text-xl font-semibold text-foreground">
            {step === "name" && "What's your name?"}
            {step === "education" &&
              "Tell us about your education"}
            {step === "skills" &&
              "What skills do you bring?"}
            {step === "interests" &&
              "What are you passionate about?"}
            {step === "resume" &&
              "Upload your resume (optional)"}
            {step === "review" && "Review your profile"}
          </h2>

          {renderStep()}

          {stepError && (
            <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {stepError}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            {currentStepIdx > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-foreground/70 transition-all duration-200 hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step === "review" ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Find My Matches
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {step !== "review" && (
          <p className="mt-4 text-center text-sm text-foreground/40">
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
    <div className="flex items-start justify-between gap-4 rounded-xl bg-muted/50 p-4">
      <span className="text-sm font-semibold text-foreground">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm text-foreground/60">
        {value}
      </span>
    </div>
  );
}

