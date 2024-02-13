#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import { defineAuthProgram } from './retro3-auth.js'
import { defineGetAccessProgram } from './retro3-get-access-token.js'
import { definePluginsProgram } from './retro3-plugins.js'
import { defineRedundancyProgram } from './retro3-redundancy.js'
import { defineUploadProgram } from './retro3-upload.js'
import { getSettings, version } from './shared/index.js'

const program = new Command()

program
  .version(version, '-v, --version')
  .usage('[command] [options]')

program.addCommand(defineAuthProgram())
program.addCommand(defineUploadProgram())
program.addCommand(defineRedundancyProgram())
program.addCommand(definePluginsProgram())
program.addCommand(defineGetAccessProgram())

// help on no command
if (!process.argv.slice(2).length) {
  const logo = '░P░e░e░r░T░u░b░e░'
  console.log(`
  ___/),.._                           ` + logo + `
/'   ,.   ."'._
(     "'   '-.__"-._             ,-
\\'='='),  "\\ -._-"-.          -"/
      / ""/"\\,_\\,__""       _" /,-
     /   /                -" _/"/
    /   |    ._\\\\ |\\  |_.".-"  /
   /    |   __\\)|)|),/|_." _,."
  /     \\_."   " ") | ).-""---''--
 (                  "/.""7__-""''
 |                   " ."._--._
 \\       \\ (_    __   ""   ".,_
  \\.,.    \\  ""   -"".-"
   ".,_,  (",_-,,,-".-
       "'-,\\_   __,-"
             ",)" ")
              /"\\-"
            ,"\\/
      _,.__/"\\/_                     (the CLI for red chocobos)
     / \\) "./,  ".
  --/---"---" "-) )---- by Chocobozzz et al.\n`)
}

getSettings()
  .then(settings => {
    const state = (settings.default === undefined || settings.default === -1)
      ? 'no instance selected, commands will require explicit arguments'
      : 'instance ' + settings.remotes[settings.default] + ' selected'

    program
      .addHelpText('after', '\n\n  State: ' + state + '\n\n' +
        '  Examples:\n\n' +
        '    $ retro3 auth add -u "RETRO3_URL" -U "RETRO3_USER" --password "RETRO3_PASSWORD"\n' +
        '    $ retro3 up <videoFile>\n'
      )
      .parse(process.argv)
  })
  .catch(err => console.error(err))
