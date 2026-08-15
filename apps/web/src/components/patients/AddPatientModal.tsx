import * as React from "react";
import { Plus, Upload, User, ShieldPlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api, uploadFile } from "@/lib/api";

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  guardianName?: string | null;
  bloodGroup?: string | null;
  maritalStatus?: string | null;
  email?: string | null;
  address?: string | null;
  nationalId?: string | null;
  photoUrl?: string | null;
  remarks?: string | null;
  allergies?: string | null;
  tpaProviderId?: string | null;
  tpaId?: string | null;
  tpaValidity?: string | null;
  alternatePhone?: string | null;
  createdAt: string;
}

interface TpaProvider {
  id: string;
  name: string;
}

const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Age display derived from DOB — never stored, always computed, so it can't go stale. */
function ageFromDob(dobStr: string): { years: string; months: string; days: string } | null {
  const dob = new Date(`${dobStr}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null; // DOB in the future
  return { years: String(years), months: String(months), days: String(days) };
}

/** The inverse — lets registration staff enter an approximate age (common when the exact DOB isn't known) instead of a date. All three parts must be present; "0/0/0" (born today) is valid. */
function dobFromAge(years: string, months: string, days: string): string | null {
  if (years === "" || months === "" || days === "") return null;
  const y = Number(years);
  const m = Number(months);
  const d = Number(days);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (y < 0 || m < 0 || d < 0) return null;
  const now = new Date();
  const dob = new Date(now.getFullYear() - y, now.getMonth() - m, now.getDate() - d);
  if (Number.isNaN(dob.getTime())) return null;
  return `${dob.getFullYear()}-${pad2(dob.getMonth() + 1)}-${pad2(dob.getDate())}`;
}

export function AddPatientModal({
  patient,
  onClose,
  onSaved,
}: {
  patient?: Patient;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!patient;

  const [name, setName] = React.useState(patient?.name ?? "");
  const [guardianName, setGuardianName] = React.useState(patient?.guardianName ?? "");
  const [phone, setPhone] = React.useState(patient?.phone ?? "");
  const [gender, setGender] = React.useState(patient?.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = React.useState(patient?.dateOfBirth ?? "");
  const initialAge = patient?.dateOfBirth ? ageFromDob(patient.dateOfBirth) : null;
  const [ageYears, setAgeYears] = React.useState(initialAge?.years ?? "");
  const [ageMonths, setAgeMonths] = React.useState(initialAge?.months ?? "");
  const [ageDays, setAgeDays] = React.useState(initialAge?.days ?? "");
  const [bloodGroup, setBloodGroup] = React.useState(patient?.bloodGroup ?? "");
  const [maritalStatus, setMaritalStatus] = React.useState(patient?.maritalStatus ?? "");
  const [email, setEmail] = React.useState(patient?.email ?? "");
  const [address, setAddress] = React.useState(patient?.address ?? "");
  const [nationalId, setNationalId] = React.useState(patient?.nationalId ?? "");
  const [photoUrl, setPhotoUrl] = React.useState(patient?.photoUrl ?? "");
  const [remarks, setRemarks] = React.useState(patient?.remarks ?? "");
  const [allergies, setAllergies] = React.useState(patient?.allergies ?? "");
  const [tpaProviderId, setTpaProviderId] = React.useState(patient?.tpaProviderId ?? "");
  const [tpaId, setTpaId] = React.useState(patient?.tpaId ?? "");
  const [tpaValidity, setTpaValidity] = React.useState(patient?.tpaValidity ?? "");
  const [alternatePhone, setAlternatePhone] = React.useState(patient?.alternatePhone ?? "");

  const [tpaProviders, setTpaProviders] = React.useState<TpaProvider[]>([]);
  const [addingProvider, setAddingProvider] = React.useState(false);
  const [newProviderName, setNewProviderName] = React.useState("");

  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    api<TpaProvider[]>("/billing/tpa-providers").then(setTpaProviders).catch(() => undefined);
  }, []);

  function onDobChange(value: string) {
    setDateOfBirth(value);
    const age = value ? ageFromDob(value) : null;
    if (age) {
      setAgeYears(age.years);
      setAgeMonths(age.months);
      setAgeDays(age.days);
    }
  }

  function onAgePartChange(part: "years" | "months" | "days", value: string) {
    const next = { years: ageYears, months: ageMonths, days: ageDays, [part]: value };
    setAgeYears(next.years);
    setAgeMonths(next.months);
    setAgeDays(next.days);
    const dob = dobFromAge(next.years, next.months, next.days);
    if (dob) setDateOfBirth(dob);
  }

  async function onPhotoFile(file: File) {
    setPhotoError(null);
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setPhotoError("Only PNG, JPEG, or WEBP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be 5MB or smaller.");
      return;
    }
    setUploadingPhoto(true);
    try {
      const { url } = await uploadFile<{ url: string }>("/patients/photo", file);
      setPhotoUrl(url);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function onAddProvider() {
    const trimmed = newProviderName.trim();
    if (!trimmed) return;
    const created = await api<TpaProvider>("/billing/tpa-providers", {
      method: "POST",
      body: JSON.stringify({ name: trimmed }),
    });
    setTpaProviders((prev) => (prev.some((p) => p.id === created.id) ? prev : [...prev, created].sort((a, b) => a.name.localeCompare(b.name))));
    setTpaProviderId(created.id);
    setNewProviderName("");
    setAddingProvider(false);
  }

  function onTpaProviderChange(value: string) {
    setTpaProviderId(value);
    if (!value) {
      // No provider selected — a TPA ID/validity with nothing to attach
      // to is meaningless, so clear them rather than leave a dangling
      // value the server would reject on save.
      setTpaId("");
      setTpaValidity("");
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!dateOfBirth) {
      setError("Provide a date of birth, or a complete age (year, month, day).");
      return;
    }
    if ((tpaId || tpaValidity) && !tpaProviderId) {
      setError("Select a TPA provider before adding a TPA ID or validity date.");
      return;
    }

    const payload = {
      name: name.trim(),
      dateOfBirth,
      gender: gender || undefined,
      phone: phone || undefined,
      guardianName: guardianName || undefined,
      bloodGroup: bloodGroup || undefined,
      maritalStatus: maritalStatus || undefined,
      email: email || undefined,
      address: address || undefined,
      nationalId: nationalId || undefined,
      photoUrl: photoUrl || undefined,
      remarks: remarks || undefined,
      allergies: allergies || undefined,
      tpaProviderId: tpaProviderId || null,
      tpaId: tpaProviderId ? tpaId || undefined : null,
      tpaValidity: tpaProviderId ? tpaValidity || undefined : null,
      alternatePhone: alternatePhone || undefined,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/patients/${patient.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api("/patients", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save patient");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm";
  const labelClass = "text-[12px] font-semibold text-text-muted";
  const fieldClass = "flex flex-col gap-1.5";

  return (
    <Modal
      title={isEdit ? "Edit Patient" : "Add Patient"}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="patient-form" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={onSave} className="flex flex-col gap-6">
        {error && <div className="rounded-sm bg-critical-soft px-3 py-2 text-[13px] text-critical">{error}</div>}

        <div className="rounded-lg border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
            <User size={16} className="text-accent" />
            <h3 className="text-[13px] font-bold">Patient Information</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
            <div className={fieldClass}>
              <label className={labelClass}>
                Name <span className="text-critical">*</span>
              </label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Guardian Name</label>
              <input className={inputClass} value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>Gender</label>
              <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select…</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Date Of Birth</label>
              <input type="date" className={inputClass} value={dateOfBirth} max={new Date().toISOString().slice(0, 10)} onChange={(e) => onDobChange(e.target.value)} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>
                Age (Y/M/D) <span className="text-critical">*</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min={0}
                  placeholder="Year"
                  className={`${inputClass} w-full`}
                  value={ageYears}
                  onChange={(e) => onAgePartChange("years", e.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  max={11}
                  placeholder="Month"
                  className={`${inputClass} w-full`}
                  value={ageMonths}
                  onChange={(e) => onAgePartChange("months", e.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  max={31}
                  placeholder="Day"
                  className={`${inputClass} w-full`}
                  value={ageDays}
                  onChange={(e) => onAgePartChange("days", e.target.value)}
                />
              </div>
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>Blood Group</label>
              <select className={inputClass} value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                <option value="">Select…</option>
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Marital Status</label>
              <select className={inputClass} value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                <option value="">Select…</option>
                {MARITAL_STATUSES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>National Identification Number</label>
              <input className={inputClass} value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Patient Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onPhotoFile(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) onPhotoFile(file);
                }}
                className={`flex items-center justify-center gap-2 rounded-sm border border-dashed px-3 py-2 text-[13px] text-text-muted transition-colors ${
                  dragOver ? "border-accent bg-accent-tint" : "border-border-strong bg-surface-2"
                }`}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Patient" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <Upload size={15} />
                )}
                {uploadingPhoto ? "Uploading…" : photoUrl ? "Replace photo" : "Drop a file here or click"}
              </button>
              {photoError && <span className="text-[12px] text-critical">{photoError}</span>}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
            <ShieldPlus size={16} className="text-accent" />
            <h3 className="text-[13px] font-bold">Additional Information</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <div className={fieldClass}>
              <label className={labelClass}>Remarks</label>
              <textarea className={`${inputClass} min-h-[70px] resize-y`} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Any Known Allergies</label>
              <textarea className={`${inputClass} min-h-[70px] resize-y`} value={allergies} onChange={(e) => setAllergies(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-3">
            <div className={fieldClass}>
              <label className={labelClass}>TPA</label>
              {addingProvider ? (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    className={`${inputClass} w-full`}
                    placeholder="New TPA name"
                    value={newProviderName}
                    onChange={(e) => setNewProviderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onAddProvider();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={onAddProvider}>
                    Add
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <select className={`${inputClass} w-full`} value={tpaProviderId} onChange={(e) => onTpaProviderChange(e.target.value)}>
                    <option value="">None</option>
                    {tpaProviders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setAddingProvider(true)}
                    title="Add a new TPA provider"
                    className="flex items-center justify-center rounded-sm border border-border-strong bg-surface px-2.5 text-text-muted hover:border-accent hover:text-accent-hover"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>TPA ID</label>
              <input
                className={inputClass}
                value={tpaId}
                disabled={!tpaProviderId}
                onChange={(e) => setTpaId(e.target.value)}
                placeholder={tpaProviderId ? "" : "Select a TPA first"}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>TPA Validity</label>
              <input
                type="date"
                className={inputClass}
                value={tpaValidity}
                disabled={!tpaProviderId}
                onChange={(e) => setTpaValidity(e.target.value)}
              />
            </div>

            <div className={fieldClass}>
              <label className={labelClass}>Alternate Number</label>
              <input className={inputClass} value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
