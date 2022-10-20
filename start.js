/** @param {NS} ns */
export async function main(ns) {
	ns.exec("hack_all_hosts_in_network.js", "home", 1, true)
	ns.exec("/scripts/v3/determinateTargetHosts.js", "home", 1, true)
	ns.exec("/scripts/v3/dirigent.js", "home", 1, true)
}