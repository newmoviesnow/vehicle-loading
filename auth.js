(function(){
  const ADMIN_EMAIL = (window.VEHICLE_LOADING_ADMIN_EMAIL || "").toLowerCase();
  const loginScreen = document.getElementById("loginScreen");
  const protectedApp = document.getElementById("protectedApp");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginButton");
  const loginStatus = document.getElementById("loginStatus");
  const logoutButton = document.getElementById("logoutButton");
  const adminEmailBadge = document.getElementById("adminEmailBadge");

  function showLogin(message, error){
    loginScreen.classList.remove("hidden");
    protectedApp.classList.add("locked");
    loginStatus.textContent = message || "";
    loginStatus.className = "login-status" + (error ? " error" : "");
  }
  function showApp(user){
    loginScreen.classList.add("hidden");
    protectedApp.classList.remove("locked");
    if(adminEmailBadge) adminEmailBadge.textContent = user.email || ADMIN_EMAIL;
  }
  function firebaseReady(){
    return window.firebase && window.FIREBASE_CONFIG &&
      window.FIREBASE_CONFIG.apiKey && !window.FIREBASE_CONFIG.apiKey.startsWith("PASTE_") &&
      window.FIREBASE_CONFIG.projectId && !window.FIREBASE_CONFIG.projectId.startsWith("PASTE_");
  }

  if(!firebaseReady()) {
    showLogin("Firebase setup is required before sign-in.", true);
    if(loginForm) loginForm.style.display = "none";
    return;
  }

  firebase.initializeApp(window.FIREBASE_CONFIG);
  const auth = firebase.auth();

  auth.onAuthStateChanged(async (user) => {
    if(user && user.email && user.email.toLowerCase() === ADMIN_EMAIL){
      showApp(user);
      return;
    }
    if(user){
      await auth.signOut();
      showLogin("This account is not authorized for the admin panel.", true);
      return;
    }
    showLogin("Sign in with the authorized administrator account.", false);
  });

  loginForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    if(email !== ADMIN_EMAIL){
      showLogin("Only the authorized administrator account can access this app.", true);
      return;
    }
    loginButton.disabled = true;
    loginButton.textContent = "SIGNING IN...";
    try{
      await auth.signInWithEmailAndPassword(email, password);
      passwordInput.value = "";
    }catch(err){
      let msg = "Login failed. Check the email and password.";
      if(err && err.code === "auth/too-many-requests") msg = "Too many attempts. Please wait and try again.";
      if(err && err.code === "auth/user-not-found") msg = "Admin account is not created in Firebase yet.";
      showLogin(msg, true);
    }finally{
      loginButton.disabled = false;
      loginButton.textContent = "SIGN IN";
    }
  });

  logoutButton.addEventListener("click", async ()=>{
    await auth.signOut();
    window.scrollTo({top:0,behavior:"smooth"});
  });
})();
