import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import type { LocalProfile, ProfileInput } from "@/types/localVisibility";

export function LocationSetupForm({
  profile,
  gridSizes,
  busy,
  onSave,
  onCancel,
}: {
  profile: LocalProfile | null;
  gridSizes: number[];
  busy: boolean;
  onSave: (input: ProfileInput) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [latitude, setLatitude] = useState(profile ? String(profile.latitude) : "");
  const [longitude, setLongitude] = useState(profile ? String(profile.longitude) : "");
  const [gridSize, setGridSize] = useState(profile?.grid_size ?? 5);
  const [radius, setRadius] = useState(profile ? String(profile.radius_km) : "5");
  const [domain, setDomain] = useState(profile?.business_domain ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusKm = Number(radius);
    if (!latitude.trim() || !longitude.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      setFormError("Enter the latitude and longitude of the business, for example 29.7604 and -95.3698.");
      return;
    }
    if (Number.isNaN(radiusKm) || radiusKm <= 0) {
      setFormError("Enter how far from the business the grid should reach, in km.");
      return;
    }
    setFormError(null);
    const saved = await onSave({ latitude: lat, longitude: lng, grid_size: gridSize, radius_km: radiusKm, business_domain: domain });
    if (saved) onCancel?.();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Latitude" htmlFor="lv-lat" hint="In Google Maps, right-click the business pin and click the numbers to copy them.">
        <TextInput id="lv-lat" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="29.7604" />
      </Field>
      <Field label="Longitude" htmlFor="lv-lng">
        <TextInput id="lv-lng" inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="-95.3698" />
      </Field>
      <Field label="Grid size" htmlFor="lv-size" hint="A bigger grid checks more spots, so a scan costs more.">
        <select
          id="lv-size"
          value={gridSize}
          onChange={(event) => setGridSize(Number(event.target.value))}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          {gridSizes.map((size) => (
            <option key={size} value={size}>
              {size} × {size} ({size * size} spots)
            </option>
          ))}
        </select>
      </Field>
      <Field label="Reach (km)" htmlFor="lv-radius" hint="Distance from the business to the edge of the grid.">
        <TextInput id="lv-radius" inputMode="decimal" value={radius} onChange={(event) => setRadius(event.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Website to look for (optional)" htmlFor="lv-domain" hint="We find the business in Google Maps by its website. Leave empty to use the business website.">
          <TextInput id="lv-domain" value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="example.com" />
        </Field>
      </div>
      {formError ? <p className="text-sm text-danger sm:col-span-2">{formError}</p> : null}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" loading={busy}>
          Save location
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
