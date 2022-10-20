/** @param {NS} ns */
export async function main(ns) {
	const hackFiles = ["hack-v2.js", "target.txt"]

	hackFiles.forEach(function (file) {
		if (!ns.fileExists(file)) {
			ns.print(file + " does not exists, cannot start hacking remote");
			ns.exit;
		}
	})

	ns.read("hosts_with_root.txt").split(",").forEach(function (host_with_root) {
		try {
			try {
				ns.killall(host_with_root);
			}
			catch (e) { }

			hackFiles.forEach(function (file) {
				try {
					ns.rm(file, host_with_root);
				} catch (e) { }
				ns.scp(file, host_with_root);
			})
			ns.print("checkpoint 1")

			var threadsToUse = Math.floor((ns.getServerMaxRam(host_with_root) - ns.getServerUsedRam(host_with_root)) / ns.getScriptRam(hackFiles[0]))
			ns.print("checkpoint 2")
			if (threadsToUse > 0) {
				ns.print("start " + hackFiles[0] + " on " + host_with_root + " in " + threadsToUse + " threads");
				ns.exec(hackFiles[0], host_with_root, threadsToUse);
			} else {
				ns.print("script cannot be run in a single thread");
			}
		} catch (error) {
			ns.print("error:" + error)
		}
	})
}