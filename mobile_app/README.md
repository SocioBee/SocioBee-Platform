#  SocioBee-mobile

A hybrid cross-platfrom mobile application(android/ios) powered by CERTH

## Dev Run
```bash
ionic serve
```

## Requirements
Node.js, 
Ionic CLI

## Installation

Install node modules, build web assets, resources and android folder

```bash
npm install
npm install -g ionic
npm install -g @ionic/cli native-run
//npm install @capacitor/android
ionic build
ionic cap add android
ionic cap copy
ionic cap sync
npx cap copy
npx cap sync
//npm run resources

```

## Firebase Android Notifications
Add in android/app the google-services.json

## Android Configuration on AndroidManifest.xml

```bash
<application android:usesCleartextTraffic="true"
```

https://www.npmjs.com/package/@capacitor-community/background-geolocation


## On build.gradle android.app
implementation 'androidx.work:work-runtime-ktx:2.7.1'


## Run on Device
ionic capacitor run android 

npx cap run android


## Run on Device Production APK
ionic capacitor run android --prod

