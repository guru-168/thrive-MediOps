import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/profile/Avatar";
import { AuthTextField } from "../components/auth/AuthTextField";
import { MaterialSymbol } from "../components/icons/MaterialSymbol";
import { useAuth } from "../context/AuthContext";
import { displayNameFor } from "../types/profile";
import type { UserProfile } from "../types/profile";

interface ProfileDraft {
  fullName: string;
  role: string;
  department: string;
}

interface FieldErrors {
  fullName?: string;
  role?: string;
  department?: string;
}

const MIN_NAME_LENGTH = 2;
const MAX_FIELD_LENGTH = 80;

/** Draft mirrors the editable fields; nulls become "" so the inputs stay controlled. */
function draftFrom(profile: UserProfile): ProfileDraft {
  return {
    fullName: profile.fullName ?? "",
    role: profile.role ?? "",
    department: profile.department ?? "",
  };
}

function formatJoinDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Account identity for the signed-in user - reached from the top-bar
 * account menu, at /profile. Every value comes from `useAuth().profile`
 * (the normalized Supabase auth user); nothing here is mocked, and there
 * is no local copy of the user that could drift from the top bar.
 *
 * Application preferences deliberately stay on the Settings page: this
 * screen is only about who the account belongs to.
 */
export function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  // Only meaningful while `editing`: the read-only view renders `profile`
  // itself, so there is no second copy of the user to fall out of date.
  // startEditing reseeds this from the live profile every time the form opens.
  const [draft, setDraft] = useState<ProfileDraft>({ fullName: "", role: "", department: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // ProtectedRoute guarantees an authenticated user before this route
  // renders, so a null profile here means the session went away underneath
  // us (sign-out, expiry) and ProtectedRoute's redirect is one render away.
  if (!profile) return null;

  function startEditing() {
    if (!profile) return;
    setDraft(draftFrom(profile));
    setFieldErrors({});
    setSaveError(null);
    setJustSaved(false);
    setEditing(true);
  }

  function cancelEditing() {
    if (!profile) return;
    setDraft(draftFrom(profile));
    setFieldErrors({});
    setSaveError(null);
    setEditing(false);
  }

  function update(key: keyof ProfileDraft, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setSaveError(null);
  }

  function validate(values: ProfileDraft): FieldErrors {
    const errors: FieldErrors = {};
    const name = values.fullName.trim();
    if (!name) errors.fullName = "Full name is required.";
    else if (name.length < MIN_NAME_LENGTH) {
      errors.fullName = `Full name must be at least ${MIN_NAME_LENGTH} characters.`;
    } else if (name.length > MAX_FIELD_LENGTH) {
      errors.fullName = `Full name must be ${MAX_FIELD_LENGTH} characters or fewer.`;
    }
    if (values.role.trim().length > MAX_FIELD_LENGTH) {
      errors.role = `Role must be ${MAX_FIELD_LENGTH} characters or fewer.`;
    }
    if (values.department.trim().length > MAX_FIELD_LENGTH) {
      errors.department = `Department must be ${MAX_FIELD_LENGTH} characters or fewer.`;
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const errors = validate(draft);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setSaveError(null);
    const { error } = await updateProfile(draft);
    setSaving(false);

    if (error) {
      setSaveError(error);
      return;
    }

    setEditing(false);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 3000);
  }

  const name = displayNameFor(profile);
  const hasName = profile.fullName !== null;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Profile</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Manage your account information.
        </p>
      </div>

      <div className="flex flex-col gap-gutter max-w-3xl w-full">
        <Card
          as="section"
          className="p-stack-lg flex flex-col sm:flex-row items-center sm:items-start gap-stack-md text-center sm:text-left"
        >
          <Avatar profile={profile} size="lg" />
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface break-words">
              {name}
            </h2>
            {hasName && (
              <p className="font-body-sm text-body-sm text-on-surface-variant break-all">
                {profile.email}
              </p>
            )}
            {(profile.role || profile.department) && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {[profile.role, profile.department].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </Card>

        <Card as="section" className="p-stack-md flex flex-col gap-stack-md">
          <div className="flex items-center justify-between gap-stack-md border-b border-outline-variant pb-stack-sm">
            <h3 className="font-title-lg text-title-lg text-on-surface">Account Information</h3>
            {!editing && (
              <div className="flex items-center gap-stack-sm shrink-0">
                {justSaved && (
                  <span
                    role="status"
                    className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant animate-fade-in-up"
                  >
                    <MaterialSymbol name="check_circle" className="!text-base" />
                    Profile updated
                  </span>
                )}
                <Button variant="secondary" className="w-auto px-stack-md" onClick={startEditing}>
                  Edit
                </Button>
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-stack-md">
              <AuthTextField
                label="Full Name"
                autoComplete="name"
                maxLength={MAX_FIELD_LENGTH}
                value={draft.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                errorText={fieldErrors.fullName}
              />
              <AuthTextField
                label="Role (optional)"
                autoComplete="organization-title"
                maxLength={MAX_FIELD_LENGTH}
                placeholder="e.g. Attending Physician"
                value={draft.role}
                onChange={(e) => update("role", e.target.value)}
                errorText={fieldErrors.role}
              />
              <AuthTextField
                label="Department (optional)"
                autoComplete="organization"
                maxLength={MAX_FIELD_LENGTH}
                placeholder="e.g. Obstetrics"
                value={draft.department}
                onChange={(e) => update("department", e.target.value)}
                errorText={fieldErrors.department}
              />

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-on-surface-variant">Email</span>
                <p className="font-body-sm text-body-sm text-on-surface break-all">
                  {profile.email}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Your email is your sign-in identity and cannot be changed here.
                </p>
              </div>

              {saveError && (
                <div className="flex items-start gap-stack-sm bg-error-container rounded-sm px-stack-sm py-2">
                  <MaterialSymbol
                    name="error"
                    className="!text-base text-on-error-container shrink-0 mt-0.5"
                  />
                  <p className="font-body-sm text-body-sm text-on-error-container">{saveError}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-stack-sm">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
                <Button
                  variant="secondary"
                  className="w-auto px-stack-md"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <dl className="flex flex-col">
              <InfoRow label="Full Name">
                {hasName ? profile.fullName : <span className="text-on-surface-variant">Not set</span>}
              </InfoRow>
              <InfoRow label="Email">
                <span className="break-all">{profile.email}</span>
              </InfoRow>
              {/* Role, Department and Member since render only when the
                  account actually has them - no invented placeholders. */}
              {profile.role && <InfoRow label="Role">{profile.role}</InfoRow>}
              {profile.department && <InfoRow label="Department">{profile.department}</InfoRow>}
              {profile.createdAt && formatJoinDate(profile.createdAt) && (
                <InfoRow label="Member since">{formatJoinDate(profile.createdAt)}</InfoRow>
              )}
            </dl>
          )}
        </Card>
      </div>
    </>
  );
}

/**
 * One label/value pair in the read-only view. Stacks on narrow screens and
 * becomes a two-column definition list from `sm` up, so long emails wrap
 * instead of forcing the card to scroll sideways.
 */
function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-stack-md py-stack-sm border-b border-outline-variant last:border-b-0">
      <dt className="font-label-md text-label-md text-on-surface-variant">{label}</dt>
      <dd className="font-body-sm text-body-sm text-on-surface min-w-0">{children}</dd>
    </div>
  );
}
