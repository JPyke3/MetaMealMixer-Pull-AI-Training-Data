import { GPTTokens } from 'gpt-tokens'
import fs from 'fs';

const usageInfo = new GPTTokens({
    model   : 'gpt-3.5-turbo-1106',
    training: {
        data  : fs
                .readFileSync('./training-bak.jsonl', 'utf-8')
                .split('\n')
                .filter(Boolean)
                .map(row => JSON.parse(row)),
        epochs: 3,
    },
})

console.info('Used tokens: ', usageInfo.usedTokens)
console.info('Used USD: ',    usageInfo.usedUSD)
