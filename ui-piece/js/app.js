var G25k = (window.G25k) ? window.G25k : {};


G25k = function() {
	var self = null,
		initialized = false,
		appEle = null,
		currentEle = null,
		activityEle = null,
		pastEle = null,
		pastListing = null;

	function __construct__(context) {
		self = context;
		appEle = document.getElementById("g25k");
		currentEle = document.getElementById("current");
		activityEle = document.getElementById("activity");
		pastEle = document.getElementById("past");
		pastListing = pastEle.getElementsByTagName("ul")[0];



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
	}

	function buildCurrentActivity(data) {
		var container = document.createElement("div"),
			h1 = document.createElement("h1"),
			strong = document.createElement("strong"),
			small = document.createElement("small");

		h1.innerHTML = "Chris is currently";
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
				oldActivity = activity.getElementsByClassName("activity")[0],
				pastActivity = buildPastActivity(data);
			
			activityEle.insertBefore(currentActivity, activityEle.firstChild);

			setTimeout(function() {
				activity.removeChild(oldActivity);
			}, 300);

			pastListing.insertBefore(pastActivity, pastListing.firstChild);

			
		}
	};
}();





document.ready = G25k.init();
