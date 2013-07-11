chrome.runtime.onInstalled.addListener(function() {
	// Gets this apps channelId which is tied to the user/appId and registers it
	// with the server compontent for push messages
	chrome.pushMessaging.getChannelId(false, function (channelId) {
		var registerData = {channelId: channelId.channelId};
		var registerPayload = JSON.stringify(registerData);
		console.log("Register Payload: " + registerPayload);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var responseText = xhr.responseText;
				var responseObj = JSON.parse(responseText);
				if (responseObj.status != undefined) {
					if (responseObj.status == "ERROR") {
						console.log("ERROR registering " + channelId.channelId + " => " + responseObj.message);
					} else if (responseObj.status == "SUCCESS") {
						console.log("SUCCESS registering " + channelId.channelId);
					}
				} else {
					console.log("status not defined. Unknown error");
				}
			}
		};
		xhr.open("POST", "http://geek-to-5k.elasticbeanstalk.com/register/", true);
		xhr.send(registerPayload);
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
	// {"elapsed":82443399,"time":1373538273307,"username":"pequots34","type":0,"activity":"driving"}
	if (message.payload) {
		var payload = JSON.parse(message.payload);
		notify('cb.jpg', 'Chris is doing something different', 'Chris is now ' + payload.activity);
		
		// store the last message this user received
		chrome.storage.sync.set({'activity':payload.activity}, function() {
			console.log('saved message via chrome.storage.sync');
		});

		// store it using syncFileSystem to Google Drive
		chrome.syncFileSystem.requestFileSystem(function(fs) {
			if (chrome.runtime.lastError) {
				console.log('syncFileSystem Error: ' + chrome.runtime.lastError.message);
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
	}
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
	chrome.app.window.create('ui-piece/index.html', {
		id: 'geekTo5KWin',
		width: 500,
		height: 700
	});
}

function createMapWindow() {
	chrome.app.window.create('map.html', {
		id: 'geekTo5KMapWin',
		width: 500,
		height: 700
	});
}

function createEggWindow() {
	chrome.app.window.create('egg.html', {
		id: 'geekTo5KEggWin',
		width: 500,
		height: 700
	});
}