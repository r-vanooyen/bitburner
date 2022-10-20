/** @param {NS} ns */
export async function main(ns) {

	ns.disableLog("getServerNumPortsRequired")
	ns.disableLog("scan")
	ns.disableLog("sleep")
	ns.disableLog("ftpcrack")
	ns.disableLog("fileExists")
	ns.disableLog("brutessh")
	ns.disableLog("relaysmtp")
	ns.disableLog("httpworm")
	ns.disableLog("sqlinject")
	ns.disableLog("nuke")
	ns.disableLog("hasRootAccess")
	ns.disableLog("getServerMaxRam")

	do {
		var visited_hosts = ['home'];
		var hosts_with_root = [];
		ns.scan().forEach(function (host) {
			hackHosts(ns, host, visited_hosts, hosts_with_root);
		})

		ns.write("hosts_with_root.txt", hosts_with_root.toString(), "w")

		var hacking_nodes = [];
		hosts_with_root.forEach(function (host) {
			if (ns.getServerMaxRam(host) > 0) {
				hacking_nodes.push(host);
			}
		})


		if (ns.fileExists("include_home.txt")) {
			hacking_nodes.push("home")
		}

		ns.write("hacking_nodes.txt", hacking_nodes.toString(), "w")

		ns.print("visited " + visited_hosts.length + ", hosts with root " + hosts_with_root.length + " hosts with ram " + hacking_nodes.length);


		if (ns.args[0])
			await ns.sleep(60000);
	}
	while (ns.args[0])
}

/** @param {NS} ns */
function hackHosts(ns, host, visited_hosts, hosts_with_root) {
	visited_hosts.push(host);
	if (!ns.hasRootAccess(host)) {
		if (ns.getServerNumPortsRequired(host) <= howManyPortsCanIOpen(ns)) {
			if (ns.fileExists("FTPCrack.exe", "home")) {
				ns.ftpcrack(host);
			}
			if (ns.fileExists("BruteSSH.exe", "home")) {
				ns.brutessh(host);
			}
			if (ns.fileExists("relaySMTP.exe", "home")) {
				ns.relaysmtp(host);
			}
			if (ns.fileExists("HTTPWorm.exe", "home")) {
				ns.httpworm(host);
			}
			if (ns.fileExists("SQLInject.exe", "home")) {
				ns.sqlinject(host);
			}

			ns.nuke(host);
			hosts_with_root.push(host);
		}
	} else {
		hosts_with_root.push(host)
	}
	ns.scan(host).forEach(function (newTarget) {
		if (visited_hosts.indexOf(newTarget) === -1) {
			if (ns.getServerNumPortsRequired(newTarget) <= howManyPortsCanIOpen(ns)) {
				hackHosts(ns, newTarget, visited_hosts, hosts_with_root);
			}
		}
	})
}

/** @param {NS} ns */
function howManyPortsCanIOpen(ns) {
	var openPorts = 0;
	if (ns.fileExists("FTPCrack.exe", "home")) {
		openPorts = openPorts + 1;
	}
	if (ns.fileExists("BruteSSH.exe", "home")) {
		openPorts = openPorts + 1;
	}
	if (ns.fileExists("relaySMTP.exe", "home")) {
		openPorts = openPorts + 1;
	}
	if (ns.fileExists("HTTPWorm.exe", "home")) {
		openPorts = openPorts + 1;
	}
	if (ns.fileExists("SQLInject.exe", "home")) {
		openPorts = openPorts + 1;
	}
	return openPorts;
}