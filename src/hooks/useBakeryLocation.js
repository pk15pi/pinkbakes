import { getMapsUrl } from "../config";

export default function useBakeryLocation(notify, closeDialog) {
  function resolveBakeryCoords() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location is not available in this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        error => {
          const message = error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Allow location access in your browser settings, then try again."
            : error.code === error.TIMEOUT
              ? "Your location could not be found in time. Please try again."
              : "Your location is currently unavailable. Check your device location settings and try again.";
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }

  async function openLocationDestination(getUrl) {
    const locationWindow = window.open("about:blank", "_blank");
    if (!locationWindow) {
      notify("Allow pop-ups for this site to open the location link.");
      return;
    }
    locationWindow.opener = null;

    try {
      const coords = await resolveBakeryCoords();
      if (locationWindow.closed) {
        notify("The location tab was closed before it could be opened.");
        return;
      }
      locationWindow.location.href = getUrl(coords);
      closeDialog();
    } catch (error) {
      locationWindow.close();
      notify(error.message || "Location permission is required to continue.");
    }
  }

  function shareBakeryLocationOnWhatsApp() {
    return openLocationDestination(({ lat, lng }) => {
      const mapsUrl = getMapsUrl(lat, lng);
      const message = "My current location: " + mapsUrl;
      return "https://wa.me/?text=" + encodeURIComponent(message);
    });
  }

  function openBakeryInGoogleMaps() {
    return openLocationDestination(({ lat, lng }) => getMapsUrl(lat, lng));
  }

  return { shareBakeryLocationOnWhatsApp, openBakeryInGoogleMaps };
}
