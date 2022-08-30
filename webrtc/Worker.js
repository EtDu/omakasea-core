import mediasoup from "mediasoup";

class Worker {
    static async createWorker() {
        const worker = await mediasoup.createWorker({
            rtcMinPort: 2000,
            rtcMaxPort: 2020,
        });
        console.log(`worker pid ${worker.pid}`);

        worker.on("died", (error) => {
            console.error("mediasoup worker has died");
            setTimeout(() => process.exit(1), 2000);
        });

        return worker;
    }
}

let WORKER;
(async () => {
    WORKER = await Worker.createWorker();
    Object.freeze(WORKER);
})();

export { WORKER };
