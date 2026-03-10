import api from "@/lib/axios";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signup = async (username, email, password) => {
    try {
        const response = await api.post("/auth/signup", { username, email, password });
        return response.data;
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    }
}

export const logout = async () => {
    try {
        await api.post("/auth/logout");
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
}