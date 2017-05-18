cd /home/lito/PorMiBarrioAPPs/
rm -rf ./platforms/android/build/outputs/apk/PMB.apk
cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./pmbdev.keystore ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk alias_name
