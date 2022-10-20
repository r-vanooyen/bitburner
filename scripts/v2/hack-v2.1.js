/** @param {NS} ns */
export async function main(ns) {
    while (true) {
        var target = ns.read("/scripts/v2/target.txt").split(",");
        var targetHost = target[0];
        var phase = target[1];
        var refreshFrequency = Number.parseInt(target[2]);

        switch (phase) {
            case "weaken":
                await ns.weaken(targetHost);
                break;
            case "grow":
                await ns.grow(targetHost);
                break;
            default:
                await ns.hack(targetHost);
                break;
        }

        await ns.sleep(refreshFrequency);
    }
}