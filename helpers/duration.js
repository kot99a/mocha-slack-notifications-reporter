function testRunDuration (startTime) {
    const endTime = Date.now();
    const timeDiff = Math.abs(endTime - startTime);

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}min ${seconds}s`;
}

module.exports = testRunDuration;