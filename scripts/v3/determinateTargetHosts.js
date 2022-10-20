/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("disableLog")
	ns.disableLog("scan")
	ns.disableLog("getHackingLevel")
	ns.disableLog("getServerRequiredHackingLevel")
	ns.disableLog("getServerGrowth")
	ns.disableLog("getServerSecurityLevel")

	do {
		var hosts = collectAllHostsInNetwork(ns, 'home', [])
		removeHostsNotHackable(ns, hosts)
		sortByGrowRateDesc(ns, hosts)
		hosts = hosts.slice(0, 5)

		//ns.print("determinated targetHostname=" + hosts.toString())

		hosts.forEach(function (host) {
			ns.print("hostname=" + host +
				", ServerGrowth=" + ns.getServerGrowth(host) +
				", SecurityLevel=" + ns.getServerSecurityLevel(host) +
				", RequiredHackingLevel=" + ns.getServerRequiredHackingLevel(host)
			)
		})

		ns.write("/scripts/v3/targetHostname.txt", hosts.toString(), "w")


		await ns.sleep(60000)
	} while (ns.args[0])

}

/** @param {NS} ns 
 *  @param {String[]} currentCollectedHostsInNetwork
 * @return {String[]}
*/
function collectAllHostsInNetwork(ns, currentHost, currentCollectedHostsInNetwork) {
	var hostsReachable = ns.scan(currentHost);

	for (var i = 0; i < hostsReachable.length; i++) {
		if (currentCollectedHostsInNetwork.indexOf(hostsReachable[i]) == -1) {
			currentCollectedHostsInNetwork.push(hostsReachable[i]);
			collectAllHostsInNetwork(ns, hostsReachable[i], currentCollectedHostsInNetwork);
		}
	}

	return currentCollectedHostsInNetwork;
}

/** @param {NS} ns 
 *  @param {String[]} allHostsInNetwork
*/
function removeHostsNotHackable(ns, allHostsInNetwork) {
	var myHackLevel = ns.getHackingLevel();
	for (var i = 0; i < allHostsInNetwork.length; i++) {
		if (Math.ceil(myHackLevel / 3) < ns.getServerRequiredHackingLevel(allHostsInNetwork[i])) {
			allHostsInNetwork.splice(i, 1);
			i--;
		}
	}
}

/** @param {NS} ns 
 *  @param {String[]} hosts
*/
function sortByGrowRateAsc(ns, hosts) {
	hosts.sort((a, b) => ns.getServerGrowth(a) - ns.getServerGrowth(b))
}
/** @param {NS} ns 
 *  @param {String[]} hosts
*/
function sortByGrowRateDesc(ns, hosts) {
	hosts.sort((a, b) => ns.getServerGrowth(b) - ns.getServerGrowth(a))
}