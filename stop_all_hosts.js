/** @param {NS} ns */
export async function main(ns) {
	var hackingNodes = ns.read("/hacking_nodes.txt").split(",");
	hackingNodes.forEach(function (host) {
		ns.killall(host)
	});
	ns.print("stopped " + hackingNodes.length + " nodes from doing anything");
}