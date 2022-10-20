/** @param {NS} ns */
export async function main(ns) {

	ns.disableLog("scp")
	ns.disableLog("getServerSecurityLevel")
	ns.disableLog("getServerMinSecurityLevel")
	ns.disableLog("getServerMoneyAvailable")
	ns.disableLog("getServerMaxMoney")
	ns.disableLog("sleep")

	var refreshFrequency = 5000;

	do {
		var target = receiveTarget(ns);
		target.push(refreshFrequency);

		ns.write("/scripts/v2/target.txt", target.toString(), "w");

		var hackingNodes = ns.read("/hacking_nodes.txt").split(",");
		hackingNodes.forEach(function (node) {
			if (node !== "")
				ns.scp("/scripts/v2/target.txt", node);
		})

		if (!ns.args[0]) {
			ns.exit();
		}
		if (ns.args[0])
			await ns.sleep(refreshFrequency);
	} while (ns.args[0])
}

/** @param {NS} ns */
function receiveTarget(ns) {
	var targetHostName = ns.read("/scripts/v2/targetHostname.txt");

	var secLevel = ns.getServerSecurityLevel(targetHostName);
	var minSecLevel = ns.getServerMinSecurityLevel(targetHostName);
	var threshSecLevel = minSecLevel + 5

	if (secLevel == minSecLevel) {
		ns.print("WARN secLevel on minimum, increase the threshSecLevel");
	}
	if (secLevel > threshSecLevel) {
		ns.print("Phase is weaken because secLvl is " + Math.round(secLevel * 10) / 10 + " but should be lower than " + threshSecLevel);
		return [targetHostName, "weaken"];
	}

	var availMoney = ns.getServerMoneyAvailable(targetHostName)
	var maxMoney = ns.getServerMaxMoney(targetHostName)
	var threshMoney = maxMoney * 0.75

	if (maxMoney == availMoney) {
		ns.print("WARN availMoney on maximum, reduce threshMoney");
	}
	if (availMoney < threshMoney) {
		ns.print("Phase is grow because availMoney is " + Math.round(availMoney / 10000) / 100 + "m but should be higher than " + Math.round(threshMoney / 10000) / 100 + "m");
		return [targetHostName, "grow"];
	}

	ns.print("Phase is hack, secLevel is " + secLevel + " and avail money is " + Math.round(availMoney / 10000) / 100 + "m");
	return [targetHostName, "hack"];
}