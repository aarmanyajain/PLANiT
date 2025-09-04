
const API_URL = "https://reqres.in/api";
const API_KEY = "reqres-free-v1";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed");
  return data; 
}

export async function signup(email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Signup failed");
  return data; 
}
