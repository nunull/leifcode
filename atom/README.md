# leif atom package

## set up

run `npm install` and `apm link` from this directory

## usage

1. open a `.leif` file or create a new file (`cmd+enter`) and set it's language
   to `Leif` (`ctrl+shift+L`, then type `Leif`)
2. write some code (i.e. `p(0, [0, 2, [3, 7], 12])`)
3. hit `ctrl+enter` to execute the block your cursor is currently on.
   this will send osc messages on `127.0.0.1:3333`.
