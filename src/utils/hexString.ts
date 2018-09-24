export let hexStringFull = (hexStr: string) => {
    return hexStr.indexOf('0x') === 0 ? hexStr : `0x${hexStr}`;
};

export let hexStringSort = (hexStr: string) => {
    return hexStr.indexOf('0x') === 0 ? hexStr.substr(2) : hexStr;
};