var socket = io();
var $loginForm = $('#login-form');
var $loginArea = $('#login-area');
var $msgForm = $('#message-form');
var $messageArea = $('#message-area');
var $errorMessage = $('#error-msg');
var $fileInput = $('#fileInput'); // File input element
var $passwordToggle = $('#passwordToggle'); // Password protection toggle
var $filePassword = $('#filePassword'); // Password input field

socket.on('connect', function() {
	$loginForm.on('submit', function(e) {
		e.preventDefault();
		var $username = $.trim($loginForm.find('input[name=username]').val());
		var $room = $.trim($loginForm.find('input[name=room]').val());
		socket.emit('joinRoom', {
			username: $username,
			room: $room
		}, function(data) {
			if (data.nameAvailable) {
				$(".room-title").text('You are in the room: ' + $room);
				$messageArea.show();
				$loginArea.hide('slow');
			} else {
				$errorMessage.text(data.error);
			}
		});
	});
});

// Handle file selection
function handleFileSelect(event) {
	const file = event.target.files[0];
	if (file) {
		const passwordProtected = $passwordToggle.prop('checked');
		const fileReader = new FileReader();

		fileReader.onload = function(e) {
			// Base64 encode the file data (you can send binary data as well)
			const fileData = e.target.result;

			// Get the file name and password (if set)
			const fileName = file.name;
			const filePassword = passwordProtected ? $filePassword.val() : null;

			// Send the file to the server
			sendFile(fileName, fileData, filePassword);
		};
		
		fileReader.readAsDataURL(file); // This reads the file as a base64-encoded string
	}
}

// Toggle visibility of password input when password protection is selected
function togglePasswordInput() {
	const passwordInput = $filePassword;
	if ($passwordToggle.prop('checked')) {
		passwordInput.show(); // Show password field
	} else {
		passwordInput.hide(); // Hide password field
	}
}

// Handle sending the file to the server
function sendFile(fileName, fileData, password) {
	socket.emit('file message', {
		fileName: fileName,
		fileData: fileData,  // File content in Base64
		passwordProtected: password ? true : false
	});
}

// Listen for incoming file messages
socket.on('file message', function(data) {
	const fileLink = $('<a>').attr('href', data.fileData).attr('download', data.fileName).text(data.fileName);
	const fileItem = $('<div>').text(`${data.username} sent a file: `).append(fileLink);
	$('#messages').append(fileItem); // Append file message to chat

	if (data.passwordProtected) {
		// Optionally, you can prompt for password protection here if required
		console.log('This file is password protected.');
	}
});

// Listen for incoming chat messages
socket.on('message', function(message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $message = $('#messages');
	$message.append('<p><strong>' + message.username + '</strong> <span class="time">' + momentTimestamp.local().format("h:mma") + '</span></p>');
	$message.append('<div class="wrap-msg"><p>' + message.text + '</p></div>');
	scrollSmoothToBottom('messages');
});

// Submit regular chat message
$msgForm.on('submit', function(e) {
	e.preventDefault();
	var $message = $msgForm.find('input[name=message]');
	var $username = $loginForm.find('input[name=username]');
	var reg = /<(.|\n)*?>/g;
	if (reg.test($message.val()) == true) {
		alert('Sorry, that is not allowed!');
	} else {
		socket.emit('message', {
			username: $.trim($username.val()),
			text: $message.val()
		});
	}
	$message.val('');
});

// Attach event listeners for file input and password toggle
$fileInput.on('change', handleFileSelect);
$passwordToggle.on('change', togglePasswordInput);

// Scroll chat to bottom
function scrollSmoothToBottom(id) {
	var div = document.getElementById(id);
	$('#' + id).animate({
		scrollTop: div.scrollHeight - div.clientHeight
	}, 500);
}