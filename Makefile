default: bundle assemble

install: bundle assemble
	adb -d install -r android/app/build/outputs/apk/debug/app-debug.apk

bundle: index.js App.tsx
	npx react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res

assemble:
	cd android && ./gradlew assembleDebug
