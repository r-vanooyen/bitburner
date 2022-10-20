/** @param {NS} ns */
export async function main(ns) {

	ns.disableLog("sleep")

	const script = "/scripts/v2/hack-v2.1.js";
	do {
		var scriptRunningOnNodes = 0;

		var hackingNodes = ns.read("/hacking_nodes.txt").split(",");
		for (var i = 0; i < hackingNodes.length; i++) {
			var host_with_root = hackingNodes[i];
			if(host_with_root === ""){
				continue;
			}
			if (!ns.fileExists(script, host_with_root)) {
				try {
					ns.killall(host_with_root);
				}
				catch (e) { }
				ns.scp(script, host_with_root);
			}
			if (!ns.scriptRunning(script, host_with_root)) {
				var threadsToUse = Math.floor((ns.getServerMaxRam(host_with_root) - ns.getServerUsedRam(host_with_root)) / ns.getScriptRam(script))

				if (threadsToUse > 0) {
					ns.print("start " + script + " on " + host_with_root + " in " + threadsToUse + " threads");
					ns.exec(script, host_with_root, threadsToUse);
					scriptRunningOnNodes = scriptRunningOnNodes + 1
					await ns.sleep(1000)
				} else {
					ns.print("script cannot be run in a single thread");
				}
			} else {
				scriptRunningOnNodes = scriptRunningOnNodes + 1
			}
		}

		ns.print("script running on " + scriptRunningOnNodes + " nodes")
		if (ns.args[0])
			await ns.sleep(60000)
	} while (ns.args[0]);
}