# Releasing

Builds and store submissions run on EAS (Expo Application Services) in the cloud, so you don't need Xcode or Android Studio. Run these commands on your own machine from the repo root.

## One-time setup

1. **Expo account and CLI**
   ```sh
   npm install -g eas-cli
   eas login
   eas init          # creates the EAS project and writes its id into app.json; commit that change
   ```
2. **App Store Connect**: create the app with bundle ID `com.jackdsilverman.pizzadough` and name "Pizza Dough". The name must be unique on the App Store; if it's taken, change `expo.name` in `app.json` too. The first `eas build -p ios` can create the bundle ID, certificates and provisioning profile for you; let it manage credentials.
3. **Google Play Console**: create the app with package `com.jackdsilverman.pizzadough`. Google requires the **first** upload to be done by hand in the Play Console, so download the first `.aab` from EAS and upload it to the Internal testing track. After that, `eas submit` can upload automatically. That needs a Google Cloud service account key with Play Console access: save it outside the repo and run `eas credentials` to add it.

## Test builds

```sh
eas build --profile preview --platform android   # APK you can install directly on an Android phone
eas build --profile preview --platform ios       # ad-hoc build; register your iPhone first with `eas device:create`
```

## Store builds

```sh
eas build --profile production --platform all
eas submit --profile production --platform ios       # goes to TestFlight
eas submit --profile production --platform android   # goes to the Play internal testing track as a draft
```

Build numbers increase automatically (`appVersionSource: remote` with `autoIncrement`). Bump `expo.version` in `app.json` for user-facing versions such as 1.0.0 → 1.1.0.

## Before submitting for review

- **Screenshots**: 6.9" and 6.5" iPhone, plus phone screenshots for Play.
- **Privacy**: the app collects no data and makes no network requests, so answer "no data collected" on both stores. You still need a privacy policy URL; a one-line page saying so is enough.
- **Export compliance**: `ITSAppUsesNonExemptEncryption` is already set to `false` in `app.json`.
- **Play content rating questionnaire and target audience**: the app has no ads, accounts or user content.

## Icons

The icon, Android adaptive icon layers, splash image and favicon in `assets/` are generated from one SVG design. To change the design, edit the colours or shapes in `scripts/make-icons.cjs` and re-run it (this uses Playwright to render the PNGs):

```sh
node scripts/make-icons.cjs assets
```
