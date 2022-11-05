import dotenv from "dotenv";
dotenv.config();

const whitelistedAddresses = ["0x8e3E7850b360B9C152481aDd56b7A510880495e7"];
const signerAddress = "0xe9A347e4bFbe5A219F3497B1CA3Ac8568a99ED6c";
const ropstenDaoDelegate = "0x5992e66c1363240BeE233d086d4c600122E759d7";
const mainnetDaoDelegate = "0x082e44ad879e804A873B4B425d80BbCa32E74415";
const adminAddresses = [
    "0x34e223Be4F9957bAFf8a4FE2e1626d62A4540c0c",
    "0x59647F98C16e9C6452131c125aD7Eb46011a500e",
    "0x49706203f6daA5979C9F09d7ee12B0a98F549ac9",
    "0x9A88d47EBb4038e9d8479A9535FCCa0d3F8Ba73B",
    "0x9d42535420817a1b96e42e7906a3b374548ae31d",
    "0x34ADE7F4205333950A360d2d3741eBCCCdcd9209",
];
const omakaseaAddress = "0x9A88d47EBb4038e9d8479A9535FCCa0d3F8Ba73B";

const networkMap = {
    1: "ethereum",
    137: "polygon",
    80001: "mumbai",
    56: "bsc",
    43114: "avax",
    3: "ropsten",
    4: "rinkeby",
};

const CACHE_HOURS = process.env.CACHE_HOURS;
const CACHE_LIMIT = CACHE_HOURS * 60 * 60;

export {
    whitelistedAddresses,
    signerAddress,
    ropstenDaoDelegate,
    mainnetDaoDelegate,
    adminAddresses,
    omakaseaAddress,
    networkMap,
    CACHE_LIMIT,
};
