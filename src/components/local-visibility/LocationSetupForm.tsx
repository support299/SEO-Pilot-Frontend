import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { localVisibilityService } from "@/api/localVisibilityService";
import { placesKeyConfigured, searchPlaces } from "@/api/placesService";
import type { LocalProfile, PlaceResult, ProfileInput } from "@/types/localVisibility";

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function LocationSetupForm({
  businessId,
  businessName,
  profile,
  gridSizes,
  busy,
  onSave,
  onCancel,
}: {
  businessId: number;
  businessName: string;
  profile: LocalProfile | null;
  gridSizes: number[];
  busy: boolean;
  onSave: (input: ProfileInput) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [latitude, setLatitude] = useState(profile ? String(profile.latitude) : "");
  const [longitude, setLongitude] = useState(profile ? String(profile.longitude) : "");
  const [gridSize, setGridSize] = useState(profile?.grid_size ?? 5);
  const initialMiles = profile
    ? profile.radius_miles !== undefined
      ? String(profile.radius_miles)
      : String(Math.round((profile.radius_km / 1.609344) * 10) / 10)
    : "5";
  const [radius, setRadius] = useState(initialMiles);
  const [domain, setDomain] = useState(profile?.business_domain ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [query, setQuery] = useState(businessName);
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [picked, setPicked] = useState<PlaceResult | null>(null);
  const [manual, setManual] = useState(false);
  const [typed, setTyped] = useState(false);

  async function runSearch(text: string, signal?: AbortSignal) {
    setSearching(true);
    setSearchError(null);
    try {
      setResults(placesKeyConfigured ? await searchPlaces(text, signal) : await localVisibilityService.searchPlaces(businessId, text));
    } catch (error) {
      if (signal?.aborted) return;
      setSearchError(error instanceof Error && error.message ? error.message : "Couldn't look that up right now. You can enter the coordinates manually instead.");
      setResults(null);
    } finally {
      if (!signal?.aborted) setSearching(false);
    }
  }

  // Search as you type, once the text has settled. Picking a result sets `picked`, which pauses this until the text changes again.
  useEffect(() => {
    const text = query.trim();
    if (!typed || text.length < 3 || (picked && text === picked.name)) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => runSearch(text, controller.signal), 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function pickPlace(place: PlaceResult) {
    setPicked(place);
    setQuery(place.name);
    setLatitude(String(place.latitude));
    setLongitude(String(place.longitude));
    const website = domainOf(place.website);
    if (website && !domain.trim()) setDomain(website);
    setResults(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusMiles = Number(radius);
    if (!latitude.trim() || !longitude.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      setFormError("Find the business above first, or enter its latitude and longitude manually.");
      return;
    }
    if (Number.isNaN(radiusMiles) || radiusMiles <= 0) {
      setFormError("Enter how far from the business the grid should reach, in miles.");
      return;
    }
    setFormError(null);
    const saved = await onSave({
      latitude: lat,
      longitude: lng,
      grid_size: gridSize,
      radius_miles: radiusMiles,
      radius_km: Math.round(radiusMiles * 1.609344 * 100) / 100,
      business_domain: domain,
    });
    if (saved) onCancel?.();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Find the business" htmlFor="lv-place" hint="Start typing the business name and city, or a street address. Pick a result and we'll fill in the map position.">
          <div className="flex gap-2">
            <TextInput
              id="lv-place"
              value={query}
              onChange={(event) => {
                setTyped(true);
                setQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
              placeholder="Trushine Window Cleaning, Houston TX"
            />
            {searching ? <span className="shrink-0 self-center text-xs text-muted">Searching…</span> : null}
          </div>
        </Field>
        {searchError ? <p className="mt-2 text-sm text-danger">{searchError}</p> : null}
        {results && results.length === 0 ? <p className="mt-2 text-sm text-muted">No places found. Try adding the city, or enter coordinates manually below.</p> : null}
        {results && results.length > 0 ? (
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
            {results.map((place) => (
              <li key={place.place_id}>
                <button type="button" onClick={() => pickPlace(place)} className="w-full px-4 py-2.5 text-left transition hover:bg-black/[0.03]">
                  <p className="text-sm font-medium text-foreground">{place.name}</p>
                  <p className="text-xs text-muted">{place.address}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {picked ? (
          <p className="mt-2 text-sm text-foreground">
            Selected: <strong>{picked.name}</strong> · {picked.address}
          </p>
        ) : null}
        <button type="button" onClick={() => setManual(!manual)} className="mt-2 text-xs font-medium text-primary hover:underline">
          {manual ? "Hide coordinates" : latitude && longitude ? "Edit coordinates" : "Enter coordinates manually"}
        </button>
      </div>
      {manual ? (
        <>
          <Field label="Latitude" htmlFor="lv-lat">
            <TextInput id="lv-lat" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="29.7604" />
          </Field>
          <Field label="Longitude" htmlFor="lv-lng">
            <TextInput id="lv-lng" inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="-95.3698" />
          </Field>
        </>
      ) : null}
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
      <Field label="Reach (miles)" htmlFor="lv-radius" hint="Distance from the business to the edge of the grid.">
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
