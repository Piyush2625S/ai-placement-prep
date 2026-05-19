import axios from 'axios'

// Base URL for all API calls — change this when you deploy to Render
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// Automatically attach JWT token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API