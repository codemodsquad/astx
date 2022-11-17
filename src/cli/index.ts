#!/usr/bin/env node

/* eslint-disable no-console */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import transform from './transform'
import init from './init'

yargs(hideBin(process.argv)).command(transform).command(init).argv
