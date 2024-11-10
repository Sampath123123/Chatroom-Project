// fileTransfer.js

let selectedFile = null;

// Toggle password input visibility
function togglePasswordInput() {
  const passwordInput = document.getElementById('filePassword');
  passwordInput.style.display = document.getElementById('passwordToggle').checked ? 'block' : 'none';
}

// Handle file selection
function handleFileSelect(event) {
  selectedFile = event.target.files[0];
}

// Send file with optional encryption
async function sendFile() {
  if (!selectedFile) return alert('Please select a file to send.');

  const reader = new FileReader();
  const passwordProtected = document.getElementById('passwordToggle').checked;
  const password = passwordProtected ? document.getElementById('filePassword').value : null;

  reader.onload = async function() {
    let fileData = reader.result;
    
    // Encrypt file data if password-protected
    if (password) {
      fileData = await encryptData(fileData, password);
    }

    // Emit file data to server
    socket.emit('file message', {
      fileName: selectedFile.name,
      fileData: fileData,
      passwordProtected: !!password,
    });
  };

  reader.readAsDataURL(selectedFile);
}