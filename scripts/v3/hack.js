/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.length == 0)
		ns.print("please give hostname as first param")
	await ns.hack(ns.args[0])
}