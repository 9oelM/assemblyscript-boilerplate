import { instantiate, ASUtil, ResultObject } from 'assemblyscript/lib/loader';
import * as path from 'path';
import { readFileAsync } from './util';

interface OwnExports {
  addNum: (x: number, y: number) => number; 
}

interface Wasm extends ResultObject { 
  exports: ASUtil & OwnExports;
}

const wasmImportPromise = readFileAsync(path.join(__dirname, "..", "/out/main.wasm"))

wasmImportPromise.then((wasm) => {
  if (!WebAssembly.validate(wasm)) throw new Error('invalid wasm file');

  instantiate<OwnExports>(wasm, {
    __external: {      
      log: (x: any) => {
        console.log(`from inside: ${x}`);
      }
    },
    env: {
      memory: new WebAssembly.Memory({
        initial: 256,
        maximum: 1024,
      }),
      table: new WebAssembly.Table({
        initial: 33,
        maximum: 33,
        element: 'anyfunc'
      }),
      abort: (msg: number, file: number, line: number, column: number) => {
        console.error("abort called at" + file + " " + line + ":" + column);
      }
      // seed?: () => number,
      // trace?(msg: number, numArgs?: number, ...args: number[]): void
    },
  }).then(async ({ exports: wasm }: Wasm) => {
    const { addNum } = wasm;

    console.log(`from outside: ${addNum(1, 2)}`);

    process.exit(0);
  }).catch(console.log);  
})