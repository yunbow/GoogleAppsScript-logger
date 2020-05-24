function main() {
    try {
        console.error('log: error.');
        console.warn('log: warn.');
        console.info('log: info.');
        console.debug('log: debug.');
        console.log({a:"aaa",b:1,c:{d:2},d:[3,4,5]});
        throw new Error('log: throw error');
    } catch (e) {
        console.error(e.stack);
    }
}