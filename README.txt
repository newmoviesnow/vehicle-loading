MOBILE DEPLOYMENT

This is a mobile-first installable PWA.

1. Upload all files in this folder to any HTTPS static host.
2. In Google Cloud Console, edit the Web OAuth Client used by the app.
3. Under Authorized JavaScript origins add the exact HTTPS origin, e.g. https://your-site.example
4. Ensure Google Drive API is enabled and OAuth consent is configured.
5. Open the HTTPS site on Android Chrome.
6. Use the browser menu -> Add to Home screen / Install app.
7. Take photos and use Generate PDF & Save to Google Drive.

The app uses Drive scope drive.file and the Client ID supplied by the user.


Developer credit: Developed By: Vivek Devmurari
