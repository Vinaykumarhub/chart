// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js";

// Firebase configuration (replace with your Firebase credentials)
const firebaseConfig = {
  apiKey: "AIzaSyAKzBXE3CY9c55MFLWRUZ2ASyJhn7iwn7s",
  authDomain: "fir-cloud-app-d197c.firebaseapp.com",
  projectId: "fir-cloud-app-d197c",
  storageBucket: "fir-cloud-app-d197c.firebasestorage.app",
  messagingSenderId: "939894627878",
  appId: "1:939894627878:web:2cc5a64c7be8d3c08490e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Handle Signup
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created! Redirecting to login.");
    window.location.href = "login.html";  // Redirect to login after successful signup
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";  // Redirect to home page after successful login
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Google Login
document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    window.location.href = "index.html";  // Redirect to home page after Google login
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Handle Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";  // Redirect to login page after logout
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Load Messages
function loadMessages() {
  const messagesContainer = document.getElementById("messages");
  const q = query(collection(db, "messages"), orderBy("createdAt"));
  
  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = "";  // Clear previous messages
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.textContent = `${msg.username}: ${msg.text}`;
      messagesContainer.appendChild(div);
    });
  });
}

// Send Message
document.getElementById('messageForm')?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('messageInput');
  const text = messageInput.value.trim();
  if (text) {
    const user = auth.currentUser;
    await addDoc(collection(db, "messages"), {
      text,
      username: user.email,
      createdAt: serverTimestamp(),
    });
    messageInput.value = "";
  }
});

// Chart Logic
const chartCanvas = document.getElementById("chartCanvas");
const chart = new Chart(chartCanvas, {
  type: 'bar',
  data: {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),  // Hourly labels (0:00 to 23:00)
    datasets: [{
      label: 'Messages per Hour',
      data: Array(24).fill(0),  // Initialize data with zeros
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Update Chart with real-time data
onSnapshot(collection(db, "messages"), (snapshot) => {
  const messagesPerHour = Array(24).fill(0);
  snapshot.forEach(doc => {
    const createdAt = doc.data().createdAt?.seconds || 0;
    const date = new Date(createdAt * 1000);  // Convert Firestore timestamp to JavaScript Date
    const hour = date.getHours();
    messagesPerHour[hour]++;
  });
  chart.data.datasets[0].data = messagesPerHour;
  chart.update();
});

// Initialize messages on Home Page
if (document.getElementById('messages')) {
  loadMessages();
}
