import axios from "axios";

class Requests {
    static get(url, options) {
        const config = {
            url,
            method: "get",
            ...options,
        };
        return axios(config);
    }

    static post(url, options) {
        const config = {
            url,
            method: "post",
            ...options,
        };
        return axios(config);
    }
}

export default Requests;
