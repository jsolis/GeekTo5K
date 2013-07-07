chrome.runtime.onInstalled.addListener(function() {
	// Gets this apps channelId which is tied to the user/appId
	chrome.pushMessaging.getChannelId(false, function (channelId) {
		// TODO: Call server component with channelId to save for future push sends
		console.log("channelId obtained: " + channelId.channelId);
		// POST to http://[DOMAIN]/register/
		var registerData = {channelId: channelId.channelId};
		var registerPayload = JSON.stringify(registerData);
		console.log(registerPayload);
	});
});

/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function(launchData) {
	createCBTrackerWindow();
});

// Listens for push messages from GCM Google Cloud Messaging
chrome.pushMessaging.onMessage.addListener(function(message) {
	// pop notification using the web notification API
	notify('cb.jpg', 'Chris is doing something different', 'Chris is now ' + message.payload);

	// store the last message this user received
	chrome.storage.sync.set({'activity':message.payload}, function() {
		console.log('saved message via chrome.storage.sync');
	});

	// store it using syncFileSystem to Google Drive
	chrome.syncFileSystem.requestFileSystem(function(fs) {
		if (chrome.runtime.lastError) {
			notify('cb.jpg', 'syncFileSystem Error', chrome.runtime.lastError.message);
			console.log('syncFileSystem Error');
		} else {
			fs.root.getFile("geekTo5KHistory.txt", {create: true},
				function(entry) {
					entry.createWriter(function(writer) {
						writer.onwriteend = function() {
							console.log('syncFileSystem was succesfull');
						};
						writer.onerror = function(e) {
							console.log('Write failed: ' + e.toString());
						};
						var date = new Date();
						var content = message.payload + ',' + date.yyyymmddhhMMss() + "\n";
						console.log('trying to write: ' + content);
						var blob = new Blob([content], {type: 'text/plain'});
						writer.seek(writer.length);
						writer.write(blob);
					}, errorHandler);
				},
				errorHandler
			);
		}
	});
});

Date.prototype.yyyymmddhhMMss = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString();
	var dd  = this.getDate().toString();
	var hh = this.getHours().toString();
	var min = this.getMinutes().toString();
	var ss = this.getSeconds().toString();
	return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]) 
			+ (hh[1]?hh:"0"+hh[0]) + (min[1]?min:"0"+min[0]) + (ss[1]?ss:"0"+ss[0]);
};

function errorHandler(msg) {
  console.log('ERROR: ', arguments);
  var message = '';
  for (var i = 0; i < arguments.length; i++) {
    var description = '';
    if (arguments[i] instanceof FileError) {
      switch (arguments[i].code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          description = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          description = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          description = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          description = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          description = 'INVALID_STATE_ERR';
          break;
        default:
          description = 'Unknown Error';
          break;
      }
      message += ': ' + description;
    } else if (arguments[i].fullPath) {
      message += arguments[i].fullPath + ' ';
    } else {
      message += arguments[i] + ' ';
    }
  }
  console.log(message);
}

function notify(icon, title, message) {
	// Desktop Notifications Draft Specifications:
	//  http://dev.chromium.org/developers/design-documents/desktop-notifications/api-specification
	// Note: There's no need to call webkitNotifications.checkPermission().
	// Extensions that declare the notifications permission are always  allowed create notifications.
	var notification = window.webkitNotifications.createNotification(icon, title, message);
	notification.show();
	notification.onclick = function() {
		createCBTrackerWindow();
	};
	setTimeout(function() {notification.cancel();}, 5000);
}

function createCBTrackerWindow() {
	chrome.app.window.create('index.html', {
		id: 'cbTrackerWin',
		width: 300,
		height: 300
	});
}