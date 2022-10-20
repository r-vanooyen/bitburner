const hackScript = "/scripts/v3/hack.js"
const growScript = "/scripts/v3/grow.js"
const weakenScript = "/scripts/v3/weaken.js"

/** @param {NS} ns */
export async function main(ns) {

	ns.disableLog("scp")
	ns.disableLog("getServerMaxRam")
	ns.disableLog("getServerUsedRam")
	ns.disableLog("sleep")
	ns.disableLog("getServerMinSecurityLevel")
	ns.disableLog("getServerSecurityLevel")
	ns.disableLog("getServerMaxMoney")
	ns.disableLog("getServerMoneyAvailable")
	ns.disableLog("exec")
	ns.disableLog("toast")

	do {
		var targetHostnames = ns.read("/scripts/v3/targetHostname.txt").split(",")
		var hackingHosts = ns.read("/hacking_nodes.txt").split(",");

		if (targetHostnames.length == 0 || targetHostnames[0] == "" || hackingHosts.length == 0 || hackingHosts[0] == "") {
			ns.print("ERROR targetHostnames=" + targetHostnames.toString())
			ns.print("ERROR hackingHosts=" + hackingHosts.toString())
			await ns.sleep(5000);
			continue;
		}

		var incompleted = false;
		for (var i = 0; i < targetHostnames.length; i++) {
			var targetHostname = targetHostnames[i];
			//ns.print("DEBUG hacking " + targetHostname + " out of list " + targetHostnames.toString())
			if (targetHostname == "") {
				ns.print("ERROR targetHostname is blanc index=" + i + " map=" + targetHostnames.toString())
			}
			var numbersOfThreadsGrow = determinateThreadsNeededToGrow(ns, targetHostname);
			var numbersOfThreadsWeaken = determinateThreadsNeededToWeaken(ns, targetHostname, numbersOfThreadsGrow) - determinateThreadsRunningScript(ns, hackingHosts, weakenScript, targetHostname);
			var numbersOfThreadsHack = determinateThreadsNeededToHack(ns, targetHostname) - determinateThreadsRunningScript(ns, hackingHosts, hackScript, targetHostname);;

			numbersOfThreadsGrow = numbersOfThreadsGrow - determinateThreadsRunningScript(ns, hackingHosts, growScript, targetHostname);

			if (sendThemDoing(ns, hackingHosts, growScript, targetHostname, numbersOfThreadsGrow) &&
				sendThemDoing(ns, hackingHosts, weakenScript, targetHostname, numbersOfThreadsWeaken) &&
				sendThemDoing(ns, hackingHosts, hackScript, targetHostname, numbersOfThreadsHack)) {
				ns.print("INFO completed " + targetHostname + ". continue with next one")
			}
			else{
				incompleted = true
				break;
			}
		}
		if(!incompleted)
			ns.toast("WARN nothing to do!", ns.enums.toast.WARNING,5000)
		await ns.sleep(5000);
	} while (ns.args[0])
}

/** @param {String} targetHostname */
/** @param {NS} ns */
function determinateThreadsNeededToGrow(ns, targetHostname) {
	var serverMoneyAvailable = ns.getServerMoneyAvailable(targetHostname)
	var multiplier = ns.getServerMaxMoney(targetHostname) / serverMoneyAvailable;
	var threads = Math.round(ns.growthAnalyze(targetHostname, multiplier));

	//ns.print("INFO need " + threads + " grow threads to multiply money " + Math.round(serverMoneyAvailable / 1000000) + "m with " + Math.round(multiplier * 100) + "%")
	return threads;
}

/** @param {String} targetHostname */
/** @param {NS} ns */
/** @param {Number} numbersOfThreadsGrow */
function determinateThreadsNeededToWeaken(ns, targetHostname, numbersOfThreadsGrow) {
	var minSecLevel = ns.getServerMinSecurityLevel(targetHostname);
	var secLevel = ns.getServerSecurityLevel(targetHostname);

	var risingSecLevelCauseOfGrowThreads = (numbersOfThreadsGrow * 0.004);
	secLevel = secLevel + risingSecLevelCauseOfGrowThreads

	var secLevelToLower = secLevel - minSecLevel;

	var numbersOfThreadsWeaken = Math.round(secLevelToLower / ns.weakenAnalyze(1))

	/*ns.print("INFO need " + numbersOfThreadsWeaken + " weaken threads to reduce current/toLower security level "
		+ Math.round(secLevel) + "/" + Math.round(secLevelToLower)
		+ " already included increase of secLevel of " + risingSecLevelCauseOfGrowThreads + " cause of growingThreads");*/

	return numbersOfThreadsWeaken;
}

/** @param {String} targetHostname
 @param {Number} numbersOfThreadsGrow 
 @param {NS} ns */
function determinateThreadsNeededToHack(ns, targetHostname) {
	var percentMoneyStolenByOneThread = ns.hackAnalyze(targetHostname)
	var moneyAvailable = ns.getServerMoneyAvailable(targetHostname);
	var maxMoney = ns.getServerMaxMoney(targetHostname);

	var moneyThreshhold = 0.7;

	var percentCurrentlyFilled = moneyAvailable / maxMoney;

	var numbersOfThreadsHack = Math.round((percentCurrentlyFilled - moneyThreshhold) / percentMoneyStolenByOneThread)

	if (numbersOfThreadsHack < 0)
		numbersOfThreadsHack = 0

	//ns.print("INFO need " + numbersOfThreadsHack + " hack threads to reduce money on server from " + (percentCurrentlyFilled * 100) + "% to " + (moneyThreshhold * 100) + "%");

	return numbersOfThreadsHack;
}

/** @param {NS} ns */
function determinateThreadsRunningScript(ns, hackingHosts, script, targetHostname) {
	var threadsRunningScript = 0;
	for (var i = 0; i < hackingHosts.length; i++) {
		//ns.print("DEBUG hackingHosts=" + hackingHosts.toString())
		var scriptRunningInfo = ns.getRunningScript(script, hackingHosts[i], targetHostname);
		if (scriptRunningInfo)
			threadsRunningScript = threadsRunningScript + scriptRunningInfo.threads
	}

	//ns.print("INFO found " + threadsRunningScript + " threads already doing " + script)

	return threadsRunningScript;
}


/** @param {NS} ns @param {String[]} hackingHosts */
function sendThemDoing(ns, hackingHosts, script, targetHostname, numbersOfThreads) {
	for (var i = 0; i < hackingHosts.length; i++) {
		var hackingHost = hackingHosts[i];
		ns.scp(script, hackingHost);

		if (ns.getRunningScript(script, hackingHost, targetHostname))
			continue;

		var threadsToUse = Math.floor((ns.getServerMaxRam(hackingHost) - ns.getServerUsedRam(hackingHost)) / ns.getScriptRam(script))

		if (threadsToUse === 0)
			continue;

		if (threadsToUse > numbersOfThreads) {
			threadsToUse = numbersOfThreads;
			numbersOfThreads = 0;
		}
		else {
			numbersOfThreads = numbersOfThreads - threadsToUse;
		}

		if (threadsToUse > 0)
			ns.exec(script, hackingHost, threadsToUse, targetHostname);

		if (numbersOfThreads === 0) {
			//ns.print("Info could execute enoght threads of script " + script + ". will continue with next script")
			return true;
		}
	}
	//ns.print("WARN could not execute enoght threads of script " + script + " on " + targetHostname)
	return false;
}