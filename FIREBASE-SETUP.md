# Vehicle Loading — Admin Login Setup

Authorized admin email:
`vivekdevmurari517@gmail.com`

## 1. Create Firebase project
1. Open Firebase Console: https://console.firebase.google.com/
2. Create a project.
3. Add a **Web app** to the project.
4. Copy the Firebase web configuration.

## 2. Enable email/password login
Firebase Console → Authentication → Sign-in method → Email/Password → Enable.

## 3. Create the admin user
Authentication → Users → Add user
- Email: `vivekdevmurari517@gmail.com`
- Choose your own password.

Do not send the password to ChatGPT or put it in the source code.

## 4. Add the Firebase config
Open `firebase-config.js` and replace the `PASTE_...` values with the Web app configuration from Firebase.

## 5. GitHub Pages
The Firebase Authentication authorized domain must include:
`newmoviesnow.github.io`

The app will only allow the exact admin email above. Any other Firebase account is immediately signed out.
