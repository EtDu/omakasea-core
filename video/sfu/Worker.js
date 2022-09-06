import mediasoup from "mediasoup";

class Worker {
  static async createWorker() {
    const worker = await mediasoup.createWorker({
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
    });
    console.log(`worker pid ${worker.pid}`);

    worker.on("died", (error) => {
      console.error("mediasoup worker has died");
      setTimeout(() => process.exit(1), 2000);
    });

    return worker;
  }
}

export default Worker;
