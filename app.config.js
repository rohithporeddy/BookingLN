// ─────────────────────────────────────────────────────────────────────────────
// APP CONFIGURATION — edit this file to customise the app for a new deployment.
// After editing, run `npm run deploy` to publish.
// ─────────────────────────────────────────────────────────────────────────────

const config = {

  // ── Identity ────────────────────────────────────────────────────────────────
  name:    'LNitro',                       // Shown in navbar, browser tab, login footer
  tagline: 'Water delivery, simplified.',     // Subtitle on the login page

  // ── GitHub Pages deployment ──────────────────────────────────────────────────
  // Must match the GitHub repository name exactly (case-sensitive).
  // Also update package.json > "homepage" to:
  //   https://<github-username>.github.io/<repo-name>
  basePath: '/BookingLN',

  // ── Product / ordering ───────────────────────────────────────────────────────
  // Controls all unit labels shown in the UI.
  // The Supabase columns (price_per_litre, litres) stay the same regardless —
  // only the display text changes here.
  unit: {
    label:      'Litres',      // e.g. 'Litres', 'Kilograms', 'Bags'
    abbr:       'L',           // e.g. 'L', 'kg', 'bags'
    priceLabel: 'per litre',   // e.g. 'per litre', 'per kg', 'per bag'
  },

  // ── Currency ─────────────────────────────────────────────────────────────────
  currency: '₹',               // Symbol prepended to all monetary values

  // ── Admin access ─────────────────────────────────────────────────────────────
  // Phone numbers that receive the 'admin' role on login.
  adminPhones: ['9999999999'],

}

export default config
