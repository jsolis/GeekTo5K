var G25k = (window.G25k) ? window.G25k : {};


G25k = function() {
	var self = null,
		initialized = false,
		appEle = null,
		heroEle = null,
		currentEle = null,
		activityEle = null,
		pastEle = null,
		pastListing = null;

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
			chrome.pushMessaging.onMessage.addListener(function(message) {
				self.addNewStatus({activity:message.payload});
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
			small = document.createElement("small");

		h1.innerHTML = "Jason is currently";
		strong.innerHTML = data.activity;
		small.innerHTML = "for the past 1 minute";
		h1.appendChild(strong);
		container.appendChild(h1);
		container.appendChild(small);
		container.className = "activity";
		return container;
	}

	function buildPastActivity(data) {
		var li = document.createElement("li"),
			h3 = document.createElement("h3"),
			small = document.createElement("small");


		h3.innerHTML = "cycling";
		small.innerHTML = "1 minute ago";
		li.appendChild(h3);
		li.appendChild(small);

		return li;
	}

	function buildHeroImage(data) {
		var node = document.createElement("div");

		node.className = "activity-image " + data.activity;
		return node;
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
