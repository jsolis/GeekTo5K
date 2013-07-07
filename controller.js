function addMessage(message) {
	var messageEl = document.createElement("LI");
	messageEl.innerHTML = message;
	messageEl.addEventListener('click', function() {
		chrome.tts.speak(message);
	});
	document.getElementById('messages').appendChild(messageEl);
}

window.addEventListener('DOMContentLoaded', function() {
	console.log("loading...");

	// get last known activity for this user
	chrome.storage.sync.get('activity', function(items) {
		addMessage("Last we heard, Chris was " + items.activity);
	});

	// Listens for push messages in the window
	chrome.pushMessaging.onMessage.addListener(function(message) {
		addMessage("Chris is now " + message.payload);
	});
});