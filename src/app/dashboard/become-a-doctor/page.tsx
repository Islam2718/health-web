"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Check,
  CheckCircle2,
  GraduationCap,
  Pencil,
  Plus,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/auth-context";
import { apiFetch, ApiError } from "@/lib/api-client";
import { isProfileComplete } from "@/lib/auth";
import {
  fetchMyDoctorProfile,
  fetchMyEducations,
  fetchMyExperiences,
  hasRole,
  type DoctorRecord,
  type EducationRecord,
  type ExperienceRecord,
} from "@/lib/doctor-profile";
import { cn } from "@/lib/utils";

type WizardStep = 1 | 2 | 3 | 4;

const steps = [
  { step: 1 as const, label: "Doctor Profile", icon: Stethoscope },
  { step: 2 as const, label: "Education", icon: GraduationCap },
  { step: 3 as const, label: "Experience", icon: Briefcase },
];

// This whole flow is doctor-only, so it uses the same amber accent as the
// rest of the doctor-themed dashboard instead of the site's default teal.
const amberSolidButtonClass =
  "border-transparent bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus-visible:border-amber-400 focus-visible:ring-amber-400/50";
const amberOutlineButtonClass =
  "border-amber-300 text-amber-700 hover:bg-amber-50 focus-visible:border-amber-400 focus-visible:ring-amber-400/50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10";

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function extractErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const body = err.body as { errors?: Record<string, string[]> } | null;
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return firstFieldError ?? err.message;
  }
  return fallback;
}

export default function BecomeADoctorPage() {
  const { user, token, isAuthenticated, isLoading, addRole } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>(1);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");
  const [savingDoctor, setSavingDoctor] = useState(false);

  // Education and experience both support multiple entries — a list plus
  // an inline add/edit form (same list-CRUD pattern as the dashboard's
  // Chamber tab), rather than a single record per step.
  const [educations, setEducations] = useState<EducationRecord[]>([]);
  const [educationFormOpen, setEducationFormOpen] = useState<"new" | number | null>(null);
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [grade, setGrade] = useState("");
  const [eduStart, setEduStart] = useState("");
  const [eduEnd, setEduEnd] = useState("");
  const [isStudying, setIsStudying] = useState(false);
  const [eduDescription, setEduDescription] = useState("");
  const [savingEducation, setSavingEducation] = useState(false);
  const [confirmDeleteEducationId, setConfirmDeleteEducationId] = useState<number | null>(null);
  const [deletingEducationId, setDeletingEducationId] = useState<number | null>(null);

  const [experiences, setExperiences] = useState<ExperienceRecord[]>([]);
  const [experienceFormOpen, setExperienceFormOpen] = useState<"new" | number | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState("");
  const [savingExperience, setSavingExperience] = useState(false);
  const [confirmDeleteExperienceId, setConfirmDeleteExperienceId] = useState<number | null>(null);
  const [deletingExperienceId, setDeletingExperienceId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Resume progress on reload — every check is token-only, no id/user_id.
  useEffect(() => {
    if (!user || !token) return;

    let cancelled = false;

    (async () => {
      const doctor = await fetchMyDoctorProfile(token);
      if (!cancelled && doctor) {
        setDoctorId(doctor.id);
        setTitle(doctor.title ?? "");
        setSpecialization(doctor.specialization ?? "");
        setLicenseNumber(doctor.license_number ?? "");
        setBio(doctor.bio ?? "");
      }

      const educations = await fetchMyEducations(token);
      if (!cancelled) setEducations(educations);

      const experiences = await fetchMyExperiences(token);
      if (!cancelled) setExperiences(experiences);

      if (!cancelled) {
        // Resume at the first not-yet-done step — a reload lands you back
        // where you actually are, instead of always restarting at step 1.
        let resolvedStep: WizardStep = 1;
        if (doctor) {
          resolvedStep = 2;
          if (educations.length > 0) resolvedStep = 3;
        }
        setStep(resolvedStep);
        setCheckingExisting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, token]);

  const saveDoctor = async () => {
    if (!token) return;
    setSavingDoctor(true);
    try {
      const payload = { title, specialization, license_number: licenseNumber, bio };
      const res = doctorId
        ? await apiFetch<{ data: DoctorRecord }>(`/doctors/${doctorId}`, { method: "PUT", token, body: payload })
        : await apiFetch<{ data: DoctorRecord }>("/doctors", { method: "POST", token, body: payload });
      setDoctorId(res.data.id);
      if (!hasRole(user?.type, "DOCTOR")) addRole("DOCTOR");
      toast.success(doctorId ? "Doctor profile updated" : "Doctor profile created");
      setStep(2);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save doctor profile."));
    } finally {
      setSavingDoctor(false);
    }
  };

  const openNewEducationForm = () => {
    setInstitution("");
    setDegree("");
    setFieldOfStudy("");
    setGrade("");
    setEduStart("");
    setEduEnd("");
    setIsStudying(false);
    setEduDescription("");
    setEducationFormOpen("new");
  };

  const openEditEducationForm = (e: EducationRecord) => {
    setInstitution(e.institution ?? "");
    setDegree(e.degree ?? "");
    setFieldOfStudy(e.field_of_study ?? "");
    setGrade(e.grade ?? "");
    setEduStart(toDateInput(e.start_date));
    setEduEnd(toDateInput(e.end_date));
    setIsStudying(!e.end_date);
    setEduDescription(e.description ?? "");
    setEducationFormOpen(e.id);
  };

  const saveEducation = async () => {
    if (!token) return;
    setSavingEducation(true);
    const isEditing = typeof educationFormOpen === "number";
    try {
      const payload = {
        institution,
        degree,
        field_of_study: fieldOfStudy,
        grade,
        start_date: eduStart || undefined,
        end_date: isStudying ? undefined : eduEnd || undefined,
        description: eduDescription,
      };
      const res = isEditing
        ? await apiFetch<{ data: EducationRecord }>(`/educations/${educationFormOpen}`, {
            method: "PUT",
            token,
            body: payload,
          })
        : await apiFetch<{ data: EducationRecord }>("/educations", { method: "POST", token, body: payload });
      setEducations((list) => (isEditing ? list.map((e) => (e.id === res.data.id ? res.data : e)) : [...list, res.data]));
      toast.success(isEditing ? "Education updated" : "Education added");
      setEducationFormOpen(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save education."));
    } finally {
      setSavingEducation(false);
    }
  };

  const deleteEducation = async (id: number) => {
    if (!token) return;
    setDeletingEducationId(id);
    try {
      await apiFetch(`/educations/${id}`, { method: "DELETE", token });
      setEducations((list) => list.filter((e) => e.id !== id));
      toast.success("Education removed");
    } catch {
      toast.error("Could not remove that entry.");
    } finally {
      setDeletingEducationId(null);
      setConfirmDeleteEducationId(null);
    }
  };

  const openNewExperienceForm = () => {
    setJobTitle("");
    setCompanyName("");
    setLocation("");
    setExpStart("");
    setExpEnd("");
    setIsCurrent(false);
    setExpDescription("");
    setExperienceFormOpen("new");
  };

  const openEditExperienceForm = (x: ExperienceRecord) => {
    setJobTitle(x.job_title ?? "");
    setCompanyName(x.company_name ?? "");
    setLocation(x.location ?? "");
    setExpStart(toDateInput(x.start_date));
    setExpEnd(toDateInput(x.end_date));
    setIsCurrent(Boolean(x.is_current));
    setExpDescription(x.description ?? "");
    setExperienceFormOpen(x.id);
  };

  const saveExperience = async () => {
    if (!token) return;
    setSavingExperience(true);
    const isEditing = typeof experienceFormOpen === "number";
    try {
      const payload = {
        job_title: jobTitle,
        company_name: companyName,
        location,
        start_date: expStart || undefined,
        end_date: isCurrent ? undefined : expEnd || undefined,
        is_current: isCurrent,
        description: expDescription,
      };
      const res = isEditing
        ? await apiFetch<{ data: ExperienceRecord }>(`/professional-experiences/${experienceFormOpen}`, {
            method: "PUT",
            token,
            body: payload,
          })
        : await apiFetch<{ data: ExperienceRecord }>("/professional-experiences", {
            method: "POST",
            token,
            body: payload,
          });
      setExperiences((list) =>
        isEditing ? list.map((x) => (x.id === res.data.id ? res.data : x)) : [...list, res.data]
      );
      toast.success(isEditing ? "Experience updated" : "Experience added");
      setExperienceFormOpen(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save professional experience."));
    } finally {
      setSavingExperience(false);
    }
  };

  const deleteExperience = async (id: number) => {
    if (!token) return;
    setDeletingExperienceId(id);
    try {
      await apiFetch(`/professional-experiences/${id}`, { method: "DELETE", token });
      setExperiences((list) => list.filter((x) => x.id !== id));
      toast.success("Experience removed");
    } catch {
      toast.error("Could not remove that entry.");
    } finally {
      setDeletingExperienceId(null);
      setConfirmDeleteExperienceId(null);
    }
  };

  if (isLoading || !isAuthenticated || !user || checkingExisting) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="size-8 rounded-full border-2 border-amber-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!isProfileComplete(user)) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1">
          <section className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6 lg:px-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">Complete your profile first</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Before applying to become a doctor, please fill in the rest of your profile (gender, date of birth,
              blood group, marital status, and address) from your dashboard.
            </p>
            <Button
              size="lg"
              className={cn("mt-6", amberSolidButtonClass)}
              render={<Link href="/dashboard" />}
              nativeButton={false}
            >
              Complete My Profile
            </Button>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-secondary/30 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Become a Doctor
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Set Up Your Doctor Profile
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              A quick, {steps.length}-step process to convert your account into a doctor profile.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          {step !== 4 && (
            <>
              <Link
                href="/dashboard"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>

              <div className="mb-8 flex items-center justify-center gap-3">
                {steps.map((s, i) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                        step === s.step
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : step > s.step
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-border text-muted-foreground"
                      )}
                    >
                      {step > s.step ? <Check className="size-4.5" /> : <s.icon className="size-4.5" />}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={cn("h-0.5 w-10 rounded-full", step > s.step ? "bg-amber-500" : "bg-border")} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-border/60 p-6">
                  <h2 className="flex items-center gap-2 font-semibold text-foreground">
                    <Stethoscope className="size-4 text-amber-600 dark:text-amber-400" />
                    Doctor Profile
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">Tell us about your medical practice.</p>

                  <div className="mt-5 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" placeholder="e.g. Consultant Cardiologist" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input id="specialization" placeholder="e.g. Cardiology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="license">License Number</Label>
                      <Input id="license" placeholder="Medical registration / license no." value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" placeholder="A short professional bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Button
                      className={cn(doctorId ? "sm:flex-1" : "w-full sm:w-auto", amberSolidButtonClass)}
                      onClick={saveDoctor}
                      disabled={savingDoctor}
                    >
                      {savingDoctor ? "Saving..." : "Save & Continue"}
                    </Button>
                    {doctorId && (
                      <Button variant="outline" className={amberOutlineButtonClass} onClick={() => setStep(2)}>
                        Next
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-border/60 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-2 font-semibold text-foreground">
                        <GraduationCap className="size-4 text-amber-600 dark:text-amber-400" />
                        Education
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your medical education background — add as many entries as you like.
                      </p>
                    </div>
                    {educationFormOpen === null && (
                      <Button size="sm" variant="outline" className={amberOutlineButtonClass} onClick={openNewEducationForm}>
                        <Plus />
                        Add Education
                      </Button>
                    )}
                  </div>

                  {educationFormOpen === null ? (
                    <>
                      <div className="mt-5 space-y-3">
                        {educations.length === 0 && (
                          <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                            No education added yet. Add your first one to continue.
                          </p>
                        )}
                        {educations.map((e) => (
                          <div key={e.id} className="rounded-xl border border-border/60 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-foreground">
                                  {[e.degree, e.field_of_study].filter(Boolean).join(" · ")}
                                </p>
                                <p className="text-sm text-muted-foreground">{e.institution}</p>
                                {(e.start_date || e.end_date) && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {toDateInput(e.start_date) || "?"} – {toDateInput(e.end_date) || "Present"}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {confirmDeleteEducationId === e.id ? (
                                  <>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteEducation(e.id)}
                                      disabled={deletingEducationId === e.id}
                                    >
                                      {deletingEducationId === e.id ? "Removing..." : "Confirm Remove"}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteEducationId(null)}>
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="icon-sm"
                                      onClick={() => openEditEducationForm(e)}
                                      aria-label="Edit education"
                                    >
                                      <Pencil />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-destructive"
                                      onClick={() => setConfirmDeleteEducationId(e.id)}
                                      aria-label="Remove education"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className={amberOutlineButtonClass} onClick={() => setStep(1)}>
                          Back
                        </Button>
                        <Button
                          className={cn("sm:flex-1", amberSolidButtonClass)}
                          onClick={() => setStep(3)}
                          disabled={educations.length === 0}
                        >
                          Continue
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="degree">Degree</Label>
                            <Input id="degree" placeholder="e.g. MBBS" value={degree} onChange={(e) => setDegree(e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="fieldOfStudy">Field of Study</Label>
                            <Input id="fieldOfStudy" placeholder="e.g. Medicine" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="institution">Institution</Label>
                          <Input id="institution" placeholder="e.g. Dhaka Medical College" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="eduStart">Start Date</Label>
                            <Input id="eduStart" type="date" value={eduStart} onChange={(e) => setEduStart(e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="eduEnd">End Date</Label>
                            <Input
                              id="eduEnd"
                              type="date"
                              value={eduEnd}
                              onChange={(e) => setEduEnd(e.target.value)}
                              disabled={isStudying}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-4">
                          <Label htmlFor="isStudying" className="cursor-pointer">
                            I&apos;m still studying here
                          </Label>
                          <Switch id="isStudying" checked={isStudying} onCheckedChange={setIsStudying} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="grade">Grade</Label>
                          <Input id="grade" placeholder="e.g. First Class" value={grade} onChange={(e) => setGrade(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="eduDescription">Description</Label>
                          <Textarea id="eduDescription" value={eduDescription} onChange={(e) => setEduDescription(e.target.value)} />
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className={amberOutlineButtonClass} onClick={() => setEducationFormOpen(null)}>
                          Cancel
                        </Button>
                        <Button
                          className={cn("sm:flex-1", amberSolidButtonClass)}
                          onClick={saveEducation}
                          disabled={savingEducation}
                        >
                          {savingEducation
                            ? "Saving..."
                            : typeof educationFormOpen === "number"
                              ? "Update Education"
                              : "Add Education"}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-border/60 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-2 font-semibold text-foreground">
                        <Briefcase className="size-4 text-amber-600 dark:text-amber-400" />
                        Professional Experience
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your work history as a medical professional — add as many entries as you like.
                      </p>
                    </div>
                    {experienceFormOpen === null && (
                      <Button size="sm" variant="outline" className={amberOutlineButtonClass} onClick={openNewExperienceForm}>
                        <Plus />
                        Add Experience
                      </Button>
                    )}
                  </div>

                  {experienceFormOpen === null ? (
                    <>
                      <div className="mt-5 space-y-3">
                        {experiences.length === 0 && (
                          <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                            No experience added yet. Add your first one to finish.
                          </p>
                        )}
                        {experiences.map((x) => (
                          <div key={x.id} className="rounded-xl border border-border/60 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-foreground">{x.job_title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {[x.company_name, x.location].filter(Boolean).join(" · ")}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {toDateInput(x.start_date) || "?"} – {x.is_current ? "Present" : toDateInput(x.end_date) || "?"}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {confirmDeleteExperienceId === x.id ? (
                                  <>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteExperience(x.id)}
                                      disabled={deletingExperienceId === x.id}
                                    >
                                      {deletingExperienceId === x.id ? "Removing..." : "Confirm Remove"}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteExperienceId(null)}>
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="icon-sm"
                                      onClick={() => openEditExperienceForm(x)}
                                      aria-label="Edit experience"
                                    >
                                      <Pencil />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-destructive"
                                      onClick={() => setConfirmDeleteExperienceId(x.id)}
                                      aria-label="Remove experience"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className={amberOutlineButtonClass} onClick={() => setStep(2)}>
                          Back
                        </Button>
                        <Button
                          className={cn("sm:flex-1", amberSolidButtonClass)}
                          onClick={() => setStep(4)}
                          disabled={experiences.length === 0}
                        >
                          Finish
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-5 space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Input id="jobTitle" placeholder="e.g. Senior Consultant" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="companyName">Hospital / Organization</Label>
                            <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="expStart">Start Date</Label>
                            <Input id="expStart" type="date" value={expStart} onChange={(e) => setExpStart(e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="expEnd">End Date</Label>
                            <Input id="expEnd" type="date" value={expEnd} onChange={(e) => setExpEnd(e.target.value)} disabled={isCurrent} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-4">
                          <Label htmlFor="isCurrent" className="cursor-pointer">
                            I currently work here
                          </Label>
                          <Switch id="isCurrent" checked={isCurrent} onCheckedChange={setIsCurrent} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="expDescription">Description</Label>
                          <Textarea id="expDescription" value={expDescription} onChange={(e) => setExpDescription(e.target.value)} />
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className={amberOutlineButtonClass} onClick={() => setExperienceFormOpen(null)}>
                          Cancel
                        </Button>
                        <Button
                          className={cn("sm:flex-1", amberSolidButtonClass)}
                          onClick={saveExperience}
                          disabled={savingExperience}
                        >
                          {savingExperience
                            ? "Saving..."
                            : typeof experienceFormOpen === "number"
                              ? "Update Experience"
                              : "Add Experience"}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <CheckCircle2 className="size-8" />
                </div>
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">Doctor profile submitted ✓</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Your doctor profile, education, and experience have been saved. This may take effect the next
                  time you sign in.
                </p>
                <Button
                  size="lg"
                  className={cn("mt-6 w-full sm:w-auto", amberSolidButtonClass)}
                  render={<Link href="/dashboard" />}
                  nativeButton={false}
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
