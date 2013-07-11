var G25k = (window.G25k) ? window.G25k : {};


G25k = function() {
	var self = null,
		initialized = false,
		appEle = null,
		heroEle = null,
		currentEle = null,
		activityEle = null,
		pastEle = null,
		pastListing = null,
		currentActivityValue = null;

	function __construct__(context) {
		self = context;
		appEle = document.getElementById("g25k");
		heroEle = document.getElementById("hero-image");
		currentEle = document.getElementById("current");
		activityEle = document.getElementById("activity");
		pastEle = document.getElementById("past");
		pastListing = pastEle.getElementsByTagName("ul")[0];

		// allow this view to be opened as normal HTML to ease development pains
		if (chrome.pushMessaging) {
			// Listens for push messages in the window
			// {"elapsed":82443399,"time":1373538273307,"username":"pequots34","type":0,"activity":"driving"}
			chrome.pushMessaging.onMessage.addListener(function(message) {
				var payload = JSON.parse(message.payload);
				self.addNewStatus({activity:payload.activity});
			});

			// get last known activity for this user
			chrome.storage.sync.get('activity', function(items) {
				self.addNewStatus({activity:items.activity});
			});
		} else {
			setTimeout(function() {
				self.addNewStatus({
					activity: "walking",
					time: "1 hour ago"
				});
			}, 500);

			setTimeout(function() {
				self.addNewStatus({
					activity: "running",
					time: "1 hour ago"
				});
			}, 2000);

			setTimeout(function() {
				self.addNewStatus({
					activity: "cycling",
					time: "1 hour ago"
				});
			}, 4000);

			setTimeout(function() {
				self.addNewStatus({
					activity: "standing",
					time: "1 hour ago"
				});
			}, 5500);
		}
	}

	function buildCurrentActivity(data) {
		var container = document.createElement("div"),
			h1 = document.createElement("h1"),
			strong = document.createElement("strong"),
			small = document.createElement("small"),
			date = new Date();

		h1.innerHTML = "Chris is currently";
		strong.innerHTML = data.activity;
		small.innerHTML = buildTime(date);

		h1.appendChild(strong);
		container.appendChild(h1);
		container.appendChild(small);
		container.className = "activity";
		return container;
	}

	function buildPastActivity(data) {
		var li = document.createElement("li"),
			h3 = document.createElement("h3"),
			small = document.createElement("small"),
			date = new Date();


		h3.innerHTML = "cycling";
		small.innerHTML = buildTime(date);
		li.appendChild(h3);
		li.appendChild(small);

		return li;
	}

	function buildHeroImage(data) {
		var node = document.createElement("div");

		node.className = "activity-image " + data.activity;
		return node;
	}

	function buildTime(date) {
		var min = date.getMinutes().toString(),
		sec = date.getSeconds().toString();
		min = (min[1]?min:"0"+min[0]);
		sec = (sec[1]?sec:"0"+sec[0]);
		return date.getHours() + ':' + min + ':' + sec;
	}


	return {
		init: function() {
			if (!initialized) {
				__construct__(this);
				initialized = true;
			}
			return this;
		},
		addNewStatus: function(data) {
			appEle.className = "currently-" + data.activity + " adding-activity";
			var currentActivity = buildCurrentActivity(data),
				oldActivity = activity.getElementsByClassName("activity")[0];
			
			if (!oldActivity) {
				activityEle.appendChild(currentActivity);
			} else {
				activityEle.insertBefore(currentActivity, activityEle.firstChild);
			}

			setTimeout(function() {
				if (oldActivity) {
					activity.removeChild(oldActivity);	
				}

				appEle.className = "currently-" + data.activity;
			}, 300);

			this.addHeroImage(data);	
			this.addPastActivity(data);
			
		},
		addPastActivity: function(data) {
			var pastActivityEle = buildPastActivity(data);

			if (typeof(pastListing.firstChild.className) != "string") {
				pastActivityEle.className = "odd";
			}

			pastListing.insertBefore(pastActivityEle, pastListing.firstChild);
		},
		addHeroImage: function(data) {
			var heroImage = buildHeroImage(data),
				oldHeroImage = heroEle.getElementsByClassName("activity-image")[0];

			if (!oldHeroImage) {
				heroEle.appendChild(heroImage);
			} else {
				heroEle.insertBefore(heroImage, heroEle.firstChild);
				setTimeout(function() {
					heroEle.removeChild(oldHeroImage);	
				}, 300);
			}
		},
		toggleMap: function(event) {
			openSideView();
			event.preventDefault();
		}
	};
}();





document.ready = G25k.init();
