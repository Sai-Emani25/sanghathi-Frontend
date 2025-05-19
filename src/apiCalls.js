import axios from "axios";
import { BASE_URL } from "./config";

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    console.log("Attempting login with URL:", `${BASE_URL}/users/login`);
    const res = await axios.post(`${BASE_URL}/users/login`, userCredential);
    
    if (userCredential.college) {
      localStorage.setItem("selectedCollege", userCredential.college);
    }
    
    // Store the token in localStorage
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      // Set the Authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
    }
    
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data.data.user });
    return res.data; 
  } catch (err) {
    console.error("Login error:", err);
    dispatch({ type: "LOGIN_FAILURE", payload: err });
    throw err;
  }
};export async function askRag(question) {
  const url = `http://localhost:8000/api/ask`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question })
  });

  const data = await res.json(); // Parse the response

  if (!res.ok) {
    console.error('Error response:', data); // Log full error object
    const message = data?.error || data?.detail || JSON.stringify(data);
    throw new Error(`RAG request failed: ${message}`);
  }

  return data.answer;
}

