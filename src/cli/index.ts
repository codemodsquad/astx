#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import transform from './transform'
import init from './init'

void yargs(hideBin(process.argv)).command(transform).command(init).argv
