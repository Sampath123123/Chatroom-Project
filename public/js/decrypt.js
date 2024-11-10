// decrypt.js

// Encrypt file data (for demonstration; ideally use a more secure method)
async function encryptData(data, password) {
    return btoa(password + data);  // Simple encoding for demonstration
  }
  
  // Decrypt file data
  async function decryptData(encryptedData, password) {
    if (!encryptedData.startsWith(password)) {
      alert("Incorrect password");
      return null;
    }
    return atob(encryptedData.slice(password.length));  // Simple decoding
  }