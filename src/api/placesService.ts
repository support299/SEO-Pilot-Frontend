import type { PlaceResult } from "@/types/localVisibility";

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = "places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri";

export const placesKeyConfigured = Boolean(import.meta.env.VITE_GOOGLE_PLACES_API_KEY);

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  websiteUri?: string;
};

/** Google Places (New) text search, called straight from the browser. The key must be restricted to this site's domains in Google Cloud. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const response = await fetch(SEARCH_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? "",
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, pageSize: 5 }),
  });
  if (!response.ok) {
    if (response.status === 400 || response.status === 403) {
      throw new Error("Google rejected the Places API key. Check the key, that Places API (New) is enabled, and that its website restrictions allow this address.");
    }
    throw new Error("Couldn't look that up right now. You can enter the coordinates manually instead.");
  }
  const body = (await response.json()) as { places?: GooglePlace[] };
  return (body.places ?? []).flatMap((place) =>
    place.location?.latitude === undefined || place.location.longitude === undefined
      ? []
      : [
          {
            place_id: place.id ?? "",
            name: place.displayName?.text ?? "",
            address: place.formattedAddress ?? "",
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            website: place.websiteUri ?? "",
          },
        ],
  );
}
