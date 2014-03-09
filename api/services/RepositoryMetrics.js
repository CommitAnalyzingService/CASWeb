/**
 * RepositoryMetrics.js
 * 
 * @author Ben Grawi <bjg1568@rit.edu>
 * @date March 2014
 * @desc Generate repository metrics
 */

/**
 * Create a new RepoMetrics class
 */
function RepositoryMetrics(thresholds, commitCount) {

	this.thresholds = thresholds;

	this.metrics = {
		individual: thresholds,
		overall: {
			above: 0,
			below: 0,
			between: 0
		},
		history: {
			ids: [],
			values: {
				quality: [],
			}
		}
	};

	// Set default options
	this.options = {
		historyFreq: 1,
		historyCount: 0,
		historyPoints: 15,
		commitCount: commitCount
	};

	// Set frequency if more than numPoints commits in repo
	if(this.options.commitCount > this.options.historyPoints) {

		// Set the interval +1 if commit count does not match perfectly
		var rawInterval = Math.floor(this.options.commitCount
			/ this.options.historyPoints);
		this.options.historyFreq = (this.options.commitCount % 10) ? rawInterval
				: rawInterval + 1;
	}

	this._currentAvgs = [];
}

/**
 * Determines the given metrics position based on the threshold
 * 
 * @param key
 * @param value
 * @returns {Object} The value and its position relative to the threshold
 */
var metricThreshold = function(key, value) {

	var threshold;

	// Set the threshold
	if(value <= this.thresholds[key + 'nonbuggy']) {
		threshold = -1;
	} else if(value >= this.thresholds[key + 'buggy']) {
		threshold = 1;
	} else {
		threshold = 0;
	}

	// Return an object with the threshold
	return {
		value: value,
		threshold: threshold
	};
},

/**
 * Parse a commit and add it to the metrics
 * 
 * @param commit
 */
parseCommit = function(commit) {

	// Set the defaults for the metric summary
	commit.metric_summary = {
		above: 0,
		below: 0,
		between: 0
	};

	// Loop through each of the commit's keys
	for(var key in commit) {

		// Is key a metric? (Metrics will always have nonbuggy in their name)
		if(this.thresholds.hasOwnProperty(key + 'nonbuggy')) {

			// Set the threshold as the metric
			commit[key] = this.metricThreshold(key, parseFloat(commit[key]));

			// Add one to the respective threshold count
			switch(commit[key].threshold) {
			case 1:
				commit.metric_summary.above++;
				break;
			case 0:
				commit.metric_summary.between++;
				break;
			case -1:
				commit.metric_summary.below++;
				break;
			}
		}
	}
	this.updateRepoMetrics(commit.metric_summary);
},

/**
 * Flushes what ever is in the this._currentAvgs to the quality metric
 */
flushHistory = function() {

	// Sum the current averages
	var sum = 0;
	for( var i = this._currentAvgs.length; i--;) {
		sum += this._currentAvgs[i];
	}

	// Push the current count as the label
	this.metrics.history.ids.push(this.options.historyCount);

	// Push the average to this value
	this.metrics.history.values.quality.unshift(sum / this._currentAvgs.length);

	// Clear current averages
	this._currentAvgs.length = 0;
},

/**
 * Update the overall metric summary
 */
updateRepoMetrics = function(summary) {

	// Add summary to overall totals
	this.metrics.overall.above += summary.above;
	this.metrics.overall.between += summary.between;
	this.metrics.overall.below += summary.below;

	// Set quality into currentAvgs
	var total = summary.above + summary.between + summary.below;
	var quality = (total == 0) ? 0 : Math.round((summary.below / total) * 100);
	this._currentAvgs.push(quality);

	// Flush history if reached frequency or at the end of the commits
	if(this.options.historyCount % this.options.historyFreq == 0
		|| this.options.historyCount == this.options.commitCount) {
		this.flushHistory();
	}

	// Increase the current count
	this.options.historyCount++;
};

RepositoryMetrics.prototype.metricThreshold = metricThreshold;
RepositoryMetrics.prototype.parseCommit = parseCommit;
RepositoryMetrics.prototype.flushHistory = flushHistory;
RepositoryMetrics.prototype.updateRepoMetrics = updateRepoMetrics;

// Export the RepoMetrics class
module.exports = RepositoryMetrics;