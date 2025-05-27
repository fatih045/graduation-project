const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY; // .env dosyanızda VITE_GOOGLE_MAPS_KEY olarak tanımlayın
if (key) {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=tr`;
  document.head.appendChild(script);
} else {
  console.error('Google Maps API key bulunamadı! .env dosyanıza VITE_GOOGLE_MAPS_KEY ekleyin.');
}
